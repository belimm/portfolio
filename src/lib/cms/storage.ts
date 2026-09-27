import 'server-only';
import { randomUUID } from 'crypto';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'fs/promises';
import path from 'path';
import { del, get, list, put } from '@vercel/blob';

/**
 * Where content snapshots, uploads and contact messages live.
 *
 * - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (production, or local with a real store).
 * - The `.data/` folder otherwise, so local development needs no account.
 *
 * Files never reach the browser by their storage URL: public files are streamed through
 * /files/... and /cv/..., which keeps URLs on our domain and works with private stores.
 */
export type StoredFile = { pathname: string; size: number; uploadedAt: Date };

export interface Storage {
   readonly mode: 'blob' | 'local';
   put(pathname: string, body: Buffer | string, contentType: string): Promise<StoredFile>;
   read(pathname: string): Promise<{ body: ReadableStream<Uint8Array>; contentType: string; size: number } | null>;
   readText(pathname: string): Promise<string | null>;
   list(prefix: string): Promise<StoredFile[]>;
   remove(pathnames: string[]): Promise<void>;
}

// Blob stores are created as public or private; the access mode on every call has to match.
const BLOB_ACCESS = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';

class BlobStorage implements Storage {
   readonly mode = 'blob' as const;

   async put(pathname: string, body: Buffer | string, contentType: string) {
      const result = await put(pathname, body, {
         access: BLOB_ACCESS,
         contentType,
         addRandomSuffix: false,
         allowOverwrite: false,
      });
      return { pathname: result.pathname, size: Buffer.byteLength(body), uploadedAt: new Date() };
   }

   async read(pathname: string) {
      const result = await get(pathname, { access: BLOB_ACCESS, useCache: false });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      return { body: result.stream, contentType: result.blob.contentType, size: result.blob.size };
   }

   async readText(pathname: string) {
      const file = await this.read(pathname);
      return file ? new Response(file.body).text() : null;
   }

   async list(prefix: string) {
      const files: StoredFile[] = [];
      let cursor: string | undefined;
      do {
         const page = await list({ prefix, cursor, limit: 1000 });
         files.push(...page.blobs.map((b) => ({ pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt })));
         cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      return files;
   }

   async remove(pathnames: string[]) {
      if (pathnames.length) await del(pathnames);
   }
}

const CONTENT_TYPES: Record<string, string> = {
   '.json': 'application/json',
   '.pdf': 'application/pdf',
   '.png': 'image/png',
   '.jpg': 'image/jpeg',
   '.jpeg': 'image/jpeg',
   '.webp': 'image/webp',
   '.avif': 'image/avif',
   '.gif': 'image/gif',
};

class LocalStorage implements Storage {
   readonly mode = 'local' as const;
   private root = path.join(process.cwd(), '.data');

   private resolve(pathname: string) {
      const full = path.resolve(this.root, pathname);
      if (!full.startsWith(this.root + path.sep)) throw new Error('Invalid path');
      return full;
   }

   async put(pathname: string, body: Buffer | string) {
      if (process.env.VERCEL) {
         // Vercel's filesystem is read-only: without a Blob store nothing can be saved.
         throw new Error('Vercel Blob is not configured: connect a Blob store to the project');
      }
      const full = this.resolve(pathname);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, body, { flag: 'wx' });
      return { pathname, size: Buffer.byteLength(body), uploadedAt: new Date() };
   }

   async read(pathname: string) {
      try {
         const data = await readFile(this.resolve(pathname));
         return {
            body: new Response(data).body!,
            contentType: CONTENT_TYPES[path.extname(pathname).toLowerCase()] ?? 'application/octet-stream',
            size: data.length,
         };
      } catch {
         return null;
      }
   }

   async readText(pathname: string) {
      try {
         return await readFile(this.resolve(pathname), 'utf8');
      } catch {
         return null;
      }
   }

   async list(prefix: string) {
      let names: string[] = [];
      try {
         names = await readdir(this.root, { recursive: true });
      } catch {
         return [];
      }
      const files: StoredFile[] = [];
      for (const name of names) {
         const pathname = name.split(path.sep).join('/');
         if (!pathname.startsWith(prefix)) continue;
         const info = await stat(path.join(this.root, name));
         if (info.isFile()) files.push({ pathname, size: info.size, uploadedAt: info.mtime });
      }
      return files;
   }

   async remove(pathnames: string[]) {
      await Promise.all(pathnames.map((p) => rm(this.resolve(p), { force: true })));
   }
}

export const storage: Storage = process.env.BLOB_READ_WRITE_TOKEN ? new BlobStorage() : new LocalStorage();

/** Sortable, collision-free file names: newest sorts last. */
export function timestampedName(ext: string) {
   return `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
}
