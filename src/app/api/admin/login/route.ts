import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, apiUrl, forwardHeaders, isSameOrigin } from '../../../../lib/server';

export async function POST(req: NextRequest) {
   if (!isSameOrigin(req)) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
   }
   const body = await req.text();
   let res: Response;
   try {
      res = await fetch(apiUrl('/api/auth/login'), {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...forwardHeaders(req) },
         body,
      });
   } catch {
      return NextResponse.json({ detail: 'API unavailable' }, { status: 502 });
   }
   const data = await res.json().catch(() => ({}));
   if (!res.ok) return NextResponse.json(data, { status: res.status });

   const response = NextResponse.json({ ok: true });
   response.cookies.set(ADMIN_COOKIE, data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(data.expires_at * 1000),
   });
   return response;
}
