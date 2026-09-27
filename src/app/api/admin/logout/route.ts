import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../../lib/auth/session';
import { isSameOrigin } from '../../../../lib/request';

export async function POST(req: NextRequest) {
   if (!isSameOrigin(req)) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });
   const response = NextResponse.json({ ok: true });
   response.cookies.delete(SESSION_COOKIE);
   return response;
}
