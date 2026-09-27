import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyPassword } from '../../../../lib/auth/password';
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '../../../../lib/auth/session';
import { verifyTotp } from '../../../../lib/auth/totp';
import { createLimiter, firstUse } from '../../../../lib/ratelimit';
import { clientIp, isSameOrigin } from '../../../../lib/request';

const Body = z.object({
   email: z.string().trim().max(200),
   password: z.string().max(200),
   code: z.string().trim().max(10).optional(),
});

// Per visitor: slows down guessing from one address.
const ipLimiter = createLimiter('login-ip', 10, 15 * 60);
// Per account: stops a distributed attack; while locked, even the right password is refused.
const accountLimiter = createLimiter('login-fail', 20, 60 * 60);

// A hash that verifies nothing, so a missing configuration takes as long as a wrong password.
const DUMMY_HASH = 'scrypt:32768:8:1:AAAAAAAAAAAAAAAAAAAAAA:' + 'A'.repeat(86);

function sameText(a: string, b: string) {
   const x = Buffer.from(a);
   const y = Buffer.from(b);
   return x.length === y.length && timingSafeEqual(x, y);
}

const tooMany = (retryAfter: number, detail: string) =>
   NextResponse.json({ detail }, { status: 429, headers: { 'Retry-After': String(retryAfter) } });

export async function POST(req: NextRequest) {
   if (!isSameOrigin(req)) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });

   const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
   const passwordHash = process.env.ADMIN_PASSWORD_HASH;
   const totpSecret = process.env.ADMIN_TOTP_SECRET;
   if (!adminEmail || !passwordHash || !process.env.SESSION_SECRET) {
      return NextResponse.json({ detail: 'Admin sign-in is not configured' }, { status: 503 });
   }

   const ip = await ipLimiter.hit(clientIp(req));
   if (!ip.ok) return tooMany(ip.retryAfter, 'Too many attempts. Try again in a few minutes.');
   const account = await accountLimiter.check('admin');
   if (!account.ok) return tooMany(account.retryAfter, 'Sign-in is locked after too many failed attempts.');

   const parsed = Body.safeParse(await req.json().catch(() => null));
   const { email = '', password = '', code = '' } = parsed.success ? parsed.data : {};

   // Always do the expensive check so timing doesn't reveal which part was wrong.
   const passwordOk = await verifyPassword(password, passwordHash || DUMMY_HASH);
   const emailOk = sameText(email.toLowerCase(), adminEmail);
   let codeOk = !totpSecret;
   if (totpSecret) {
      const step = verifyTotp(totpSecret, code);
      // Each code works once, even inside its 30-second window. Only spend it on an otherwise
      // correct sign-in, so failed guesses can't burn the owner's current code.
      codeOk = step !== null && passwordOk && emailOk && (await firstUse(`totp:${step}`, 120));
   }

   if (!(passwordOk && emailOk && codeOk)) {
      await accountLimiter.hit('admin');
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
      return NextResponse.json(
         { detail: totpSecret ? 'Wrong email, password or code' : 'Wrong email or password' },
         { status: 401 }
      );
   }

   const response = NextResponse.json({ ok: true });
   response.cookies.set(SESSION_COOKIE, await createSession(adminEmail), sessionCookieOptions);
   return response;
}
