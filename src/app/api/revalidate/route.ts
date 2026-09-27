import { timingSafeEqual } from 'crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_TAG } from '../../../lib/content';

/** Called by the API after every admin change so the homepage shows it right away. */
export async function POST(req: NextRequest) {
   const expected = process.env.PORTFOLIO_SECRET ?? '';
   const given = req.headers.get('x-portfolio-secret') ?? '';
   const ok =
      expected.length > 0 &&
      given.length === expected.length &&
      timingSafeEqual(Buffer.from(given), Buffer.from(expected));
   if (!ok) return NextResponse.json({ detail: 'Forbidden' }, { status: 403 });

   revalidateTag(CONTENT_TAG);
   revalidatePath('/');
   revalidatePath('/tr');
   return NextResponse.json({ revalidated: true });
}
