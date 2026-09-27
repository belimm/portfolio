import { NextRequest, NextResponse } from 'next/server';
import { apiUrl, forwardHeaders } from '../../../lib/server';

export async function POST(req: NextRequest) {
   const body = await req.text();
   try {
      const res = await fetch(apiUrl('/api/public/messages'), {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...forwardHeaders(req) },
         body,
         signal: AbortSignal.timeout(8000),
      });
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
   } catch {
      return NextResponse.json({ detail: 'Inbox unavailable' }, { status: 502 });
   }
}
