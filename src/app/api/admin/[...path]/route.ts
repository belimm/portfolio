import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, apiUrl, isSameOrigin } from '../../../../lib/server';

/**
 * Forwards /api/admin/* to the API's /api/admin/*, turning the httpOnly session cookie into
 * a bearer token. The browser never sees the token and never talks to the API directly.
 */
async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
   if (!isSameOrigin(req)) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
   }
   const token = req.cookies.get(ADMIN_COOKIE)?.value;
   if (!token) {
      return NextResponse.json({ detail: 'Not signed in' }, { status: 401 });
   }

   const { path } = await params;
   const target = apiUrl(`/api/admin/${path.map(encodeURIComponent).join('/')}`);
   const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method);

   let upstream: Response;
   try {
      upstream = await fetch(target, {
         method: req.method,
         headers: {
            Authorization: `Bearer ${token}`,
            ...(req.headers.get('content-type')
               ? { 'Content-Type': req.headers.get('content-type')! }
               : {}),
         },
         body: hasBody ? await req.arrayBuffer() : undefined,
         cache: 'no-store',
      });
   } catch {
      return NextResponse.json({ detail: 'API unavailable' }, { status: 502 });
   }

   const response = new NextResponse(upstream.status === 204 ? null : upstream.body, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
   });
   if (upstream.status === 401) response.cookies.delete(ADMIN_COOKIE);
   return response;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
