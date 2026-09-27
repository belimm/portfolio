import { NextRequest, NextResponse } from 'next/server';
import { CvLang } from '../../../lib/cms/schema';
import { storage } from '../../../lib/cms/storage';
import { getPublished } from '../../../lib/content';

/** The PDF bundled with the site, used until a CV has been uploaded in /admin. */
const BUNDLED_CV = '/BerkLimoncu_CV.pdf';

/**
 * /cv/en.pdf and /cv/tr.pdf: always the active version for that language (Turkish falls back
 * to English). A stable link to share, whatever version is current.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
   const match = (await params).file.match(/^(en|tr)\.pdf$/);
   if (!match) return new Response('Not found', { status: 404 });
   const lang = match[1] as CvLang;

   const { cv } = (await getPublished()).content;
   const pick = (l: CvLang) => cv[l].versions.find((v) => v.id === cv[l].activeId);
   const version = pick(lang) ?? pick('en');
   if (!version) return NextResponse.redirect(new URL(BUNDLED_CV, req.url));

   const etag = `"${version.id}"`;
   const headers = { ETag: etag, 'Cache-Control': 'public, max-age=0, must-revalidate' };
   if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });

   const file = await storage.read(version.pathname);
   if (!file) return NextResponse.redirect(new URL(BUNDLED_CV, req.url));
   const downloadName = version.fileName.replace(/[^\w.\- ]+/g, '_');
   return new Response(file.body, {
      headers: {
         ...headers,
         'Content-Type': 'application/pdf',
         'Content-Length': String(file.size),
         'Content-Disposition': `inline; filename="${downloadName}"`,
         'X-Content-Type-Options': 'nosniff',
      },
   });
}
