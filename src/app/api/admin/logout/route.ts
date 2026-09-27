import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, isSameOrigin } from '../../../../lib/server';

export async function POST(req: NextRequest) {
   if (!isSameOrigin(req)) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
   }
   const response = NextResponse.json({ ok: true });
   response.cookies.delete(ADMIN_COOKIE);
   return response;
}
