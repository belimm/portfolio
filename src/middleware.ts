import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from './lib/auth/session';

const PUBLIC_ADMIN_PATHS = new Set(['/admin/login', '/api/admin/login', '/api/admin/logout']);

/**
 * Verifies the signed session for everything under /admin and /api/admin. Route handlers
 * verify it again, so a middleware mistake alone can't expose the admin API.
 */
export async function middleware(req: NextRequest) {
   const { pathname } = req.nextUrl;
   const signedIn = (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) !== null;

   let response: NextResponse;
   if (PUBLIC_ADMIN_PATHS.has(pathname)) {
      response =
         signedIn && pathname === '/admin/login'
            ? NextResponse.redirect(new URL('/admin', req.url))
            : NextResponse.next();
   } else if (!signedIn) {
      response = pathname.startsWith('/api/')
         ? NextResponse.json({ detail: 'Not signed in' }, { status: 401 })
         : NextResponse.redirect(new URL('/admin/login', req.url));
   } else {
      response = NextResponse.next();
   }

   response.headers.set('X-Robots-Tag', 'noindex, nofollow');
   response.headers.set('X-Frame-Options', 'DENY');
   response.headers.set('Cache-Control', 'no-store');
   response.headers.set('Referrer-Policy', 'same-origin');
   return response;
}

export const config = {
   matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
