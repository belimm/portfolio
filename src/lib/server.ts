import 'server-only';
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'pf_admin';

export function apiUrl(path: string) {
   const base = process.env.API_URL;
   if (!base) throw new Error('API_URL is not set');
   return `${base.replace(/\/$/, '')}${path}`;
}

/** Headers that let the API trust the visitor IP we forward (used for rate limiting). */
export function forwardHeaders(req: NextRequest): Record<string, string> {
   const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '';
   return {
      'x-portfolio-secret': process.env.PORTFOLIO_SECRET ?? '',
      ...(ip ? { 'x-visitor-ip': ip } : {}),
   };
}

/** Blocks cross-site form posts against cookie-authenticated routes. */
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
