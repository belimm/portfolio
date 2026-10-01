import { after, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { saveMessage } from '../../../lib/cms/messages';
import { notifyNewMessage } from '../../../lib/notify';
import { createLimiter } from '../../../lib/ratelimit';
import { clientIp } from '../../../lib/request';

const Body = z.object({
   name: z.string().trim().min(1).max(120),
   email: z.email().max(200),
   body: z.string().trim().min(1).max(5000),
   // Honeypot: hidden from people, bots tend to fill it.
   website: z.string().max(200).optional(),
});

const limiter = createLimiter('contact', 5, 10 * 60);

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' });

/** Where the message came from, for the notification: page, language and (on Vercel) location. */
function context(req: NextRequest) {
   let page: string | undefined;
   try {
      const referer = new URL(req.headers.get('referer') ?? '');
      // Only trust our own pages; anything else is left out.
      if (referer.host === req.headers.get('host')) page = referer.pathname;
   } catch {}
   const countryCode = req.headers.get('x-vercel-ip-country') ?? undefined;
   const city = req.headers.get('x-vercel-ip-city');
   return {
      page,
      language: page?.startsWith('/tr') ? ('tr' as const) : ('en' as const),
      city: city ? decodeURIComponent(city) : undefined,
      country: countryCode ? (countryNames.of(countryCode) ?? countryCode) : undefined,
   };
}

export async function POST(req: NextRequest) {
   const parsed = Body.safeParse(await req.json().catch(() => null));
   if (!parsed.success) return NextResponse.json({ detail: 'Invalid message' }, { status: 422 });
   const { website, ...message } = parsed.data;
   // Pretend it worked so bots don't adapt.
   if (website) return NextResponse.json({ ok: true }, { status: 202 });

   const { ok, retryAfter } = await limiter.hit(clientIp(req));
   if (!ok) {
      return NextResponse.json(
         { detail: 'Too many messages' },
         { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
   }
   const createdAt = new Date().toISOString();
   const details = { ...message, ...context(req), createdAt };
   try {
      await saveMessage(message, createdAt);
   } catch (error) {
      console.error('Saving a contact message failed:', error);
      // The inbox is down: the notification is now the only copy, so wait for it.
      const delivered = await notifyNewMessage({ ...details, savedToInbox: false });
      return delivered
         ? NextResponse.json({ ok: true }, { status: 202 })
         : NextResponse.json({ detail: 'Could not save the message' }, { status: 500 });
   }

   // Saved: notify after the response is sent, so the visitor isn't kept waiting.
   after(() => notifyNewMessage({ ...details, savedToInbox: true }));
   return NextResponse.json({ ok: true }, { status: 202 });
}
