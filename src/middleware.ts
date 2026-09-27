import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE = 'pf_admin';

/**
 * Keeps signed-out visitors on the login screen. This only checks that a session cookie
 * exists; the API verifies the token itself on every request.
 */
export function middleware(req: NextRequest) {
   const { pathname } = req.nextUrl;
   const signedIn = req.cookies.has(ADMIN_COOKIE);
   const onLogin = pathname === '/admin/login';

   let response: NextResponse;
   if (!signedIn && !onLogin) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      response = NextResponse.redirect(url);
   } else if (signedIn && onLogin) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin';
      response = NextResponse.redirect(url);
   } else {
      response = NextResponse.next();
   }
   response.headers.set('X-Robots-Tag', 'noindex, nofollow');
   return response;
}

export const config = {
   matcher: ['/admin', '/admin/:path*'],
};
