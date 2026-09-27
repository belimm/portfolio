import { jwtVerify, SignJWT } from 'jose';

/**
 * Admin sessions: an HS256-signed JWT in an httpOnly cookie. Edge-compatible (no Node APIs),
 * so the same check runs in middleware and in every admin route handler.
 */
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

// The __Host- prefix makes the browser refuse the cookie unless it's Secure, host-only and path=/.
export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-pf_session' : 'pf_session';

function secretKey() {
   const secret = process.env.SESSION_SECRET;
   if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters');
   return new TextEncoder().encode(secret);
}

export async function createSession(email: string) {
   return new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(email)
      .setIssuedAt()
      .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
      .sign(secretKey());
}

/** The signed-in admin's email, or null. */
export async function verifySession(token: string | undefined): Promise<string | null> {
   if (!token) return null;
   try {
      const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] });
      return payload.sub && payload.sub === process.env.ADMIN_EMAIL?.toLowerCase() ? payload.sub : null;
   } catch {
      return null;
   }
}

export const sessionCookieOptions = {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'strict' as const,
   path: '/',
   maxAge: SESSION_TTL_SECONDS,
};
