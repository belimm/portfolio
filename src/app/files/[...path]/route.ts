import { NextRequest } from 'next/server';
import { storage } from '../../../lib/cms/storage';

/** Serves uploaded images and PDFs. Only uploads/ is reachable: never content snapshots or messages. */
const SAFE_PATH = /^uploads\/(images|cv)\/[0-9]{13}-[0-9a-f]{8}\.(png|jpg|gif|webp|avif|pdf)$/;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
   const pathname = (await params).path.join('/');
   if (!SAFE_PATH.test(pathname)) return new Response('Not found', { status: 404 });
   const file = await storage.read(pathname);
   if (!file) return new Response('Not found', { status: 404 });
   return new Response(file.body, {
      headers: {
         'Content-Type': file.contentType,
         'Content-Length': String(file.size),
         // File names are unique and never overwritten.
         'Cache-Control': 'public, max-age=31536000, immutable',
         'X-Content-Type-Options': 'nosniff',
      },
   });
}
