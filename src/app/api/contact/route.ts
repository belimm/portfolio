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
   try {
      await saveMessage(message, createdAt);
   } catch (error) {
      console.error('Saving a contact message failed:', error);
      // The inbox is down: the notification is now the only copy, so wait for it.
      const delivered = await notifyNewMessage({ ...message, createdAt, savedToInbox: false });
      return delivered
         ? NextResponse.json({ ok: true }, { status: 202 })
         : NextResponse.json({ detail: 'Could not save the message' }, { status: 500 });
   }

   // Saved: notify after the response is sent, so the visitor isn't kept waiting.
   after(() => notifyNewMessage({ ...message, createdAt, savedToInbox: true }));
   return NextResponse.json({ ok: true }, { status: 202 });
}
