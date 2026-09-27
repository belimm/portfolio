import 'server-only';
import { storage, timestampedName } from './storage';

/**
 * Uploads go through our route, so they're capped below Vercel's 4.5 MB request limit.
 * The file's first bytes must match its type: a renamed .exe won't pass as a PDF.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const TYPES = {
   'application/pdf': { ext: '.pdf', magic: (b: Buffer) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
   'image/png': { ext: '.png', magic: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
   'image/jpeg': { ext: '.jpg', magic: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
   'image/gif': { ext: '.gif', magic: (b: Buffer) => b.subarray(0, 4).toString('latin1') === 'GIF8' },
   'image/webp': {
      ext: '.webp',
      magic: (b: Buffer) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP',
   },
   'image/avif': { ext: '.avif', magic: (b: Buffer) => b.subarray(4, 12).toString('latin1').startsWith('ftypavi') },
} as const;

export type UploadKind = 'images' | 'cv';

export class UploadError extends Error {}

export async function saveUpload(file: File, kind: UploadKind) {
   const type = TYPES[file.type as keyof typeof TYPES];
   if (!type) throw new UploadError('Upload a PDF, PNG, JPEG, WebP, AVIF or GIF');
   if (kind === 'cv' && file.type !== 'application/pdf') throw new UploadError('CVs must be PDFs');
   if (kind === 'images' && file.type === 'application/pdf') throw new UploadError('Images only here');
   if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('Files must be under 4 MB');

   const data = Buffer.from(await file.arrayBuffer());
   if (!type.magic(data)) throw new UploadError("The file's contents don't match its type");

   const pathname = `uploads/${kind}/${timestampedName(type.ext)}`;
   await storage.put(pathname, data, file.type);
   return { pathname, url: `/files/${pathname}`, size: data.length, fileName: file.name.slice(0, 200) };
}
