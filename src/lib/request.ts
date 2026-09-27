import 'server-only';
import type { NextRequest } from 'next/server';

/** Visitor IP. On Vercel (and behind Coolify's proxy) x-forwarded-for is set by the platform. */
export function clientIp(req: NextRequest) {
   return (
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
   );
}

/** Blocks cross-site requests against cookie-authenticated routes (on top of SameSite=Strict). */
export function isSameOrigin(req: NextRequest) {
   const origin = req.headers.get('origin');
   if (!origin) return req.method === 'GET' || req.method === 'HEAD';
   const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
   try {
      return new URL(origin).host === host;
   } catch {
      return false;
   }
}
