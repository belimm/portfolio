import 'server-only';
import { revalidatePath, revalidateTag } from 'next/cache';
import seed from './seed.json';
import { SiteContent, SiteContentSchema } from './schema';
import { storage, timestampedName } from './storage';

/**
 * Content is saved as immutable snapshots (content/<timestamp>-<id>.json). The newest one is
 * live; older ones are the edit history. Never overwriting a file sidesteps CDN staleness and
 * gives undo for free.
 */
const PREFIX = 'content/';
const KEEP_SNAPSHOTS = 40;

export const CONTENT_TAG = 'content';

type Snapshot = { savedAt: string; note: string; content: SiteContent };
export type HistoryEntry = { pathname: string; savedAt: string; note: string };

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

async function snapshotFiles() {
   const files = await storage.list(PREFIX);
   return files.filter((f) => f.pathname.endsWith('.json')).sort((a, b) => b.pathname.localeCompare(a.pathname));
}

async function readSnapshot(pathname: string): Promise<Snapshot> {
   const raw = await storage.readText(pathname);
   if (raw === null) throw new NotFoundError('Snapshot not found');
   const data = JSON.parse(raw);
   return { savedAt: data.savedAt, note: data.note ?? '', content: SiteContentSchema.parse(data.content) };
}

/** The live content and when it was saved. Falls back to the bundled seed until the first save. */
export async function loadLive(): Promise<{ content: SiteContent; savedAt: string | null }> {
   const [latest] = await snapshotFiles();
   if (!latest) return { content: SiteContentSchema.parse(seed), savedAt: null };
   const { content, savedAt } = await readSnapshot(latest.pathname);
   return { content, savedAt };
}

export async function loadContent(): Promise<SiteContent> {
   return (await loadLive()).content;
}

export async function saveContent(content: SiteContent, note: string): Promise<SiteContent> {
   const valid = SiteContentSchema.parse(stripEmptyTranslations(content));
   const snapshot: Snapshot = { savedAt: new Date().toISOString(), note, content: valid };
   await storage.put(`${PREFIX}${timestampedName('.json')}`, JSON.stringify(snapshot), 'application/json');

   const old = (await snapshotFiles()).slice(KEEP_SNAPSHOTS);
   await storage.remove(old.map((f) => f.pathname));

   revalidateTag(CONTENT_TAG);
   revalidatePath('/');
   revalidatePath('/tr');
   return valid;
}

/** Load, change, validate, save. `change` may throw to abort (e.g. NotFoundError). */
export async function updateContent(note: string, change: (draft: SiteContent) => void) {
   const draft = structuredClone(await loadContent());
   change(draft);
   return saveContent(draft, note);
}

export async function listHistory(): Promise<HistoryEntry[]> {
   const files = await snapshotFiles();
   const entries = await Promise.all(
      files.map(async (f) => {
         const raw = await storage.readText(f.pathname);
         const data = raw ? JSON.parse(raw) : {};
         return { pathname: f.pathname, savedAt: data.savedAt ?? f.uploadedAt.toISOString(), note: data.note ?? '' };
      })
   );
   return entries;
}

export async function restoreSnapshot(pathname: string) {
   if (!pathname.startsWith(PREFIX)) throw new NotFoundError('Snapshot not found');
   const snapshot = await readSnapshot(pathname);
   return saveContent(snapshot.content, `Restored the version from ${snapshot.savedAt}`);
}

/** Empty translated fields should fall back to English, so they're not stored at all. */
function stripEmptyTranslations(content: SiteContent): SiteContent {
   const clean = <T extends { translations?: { tr?: Record<string, unknown> } }>(item: T): T => {
      const tr = Object.fromEntries(
         Object.entries(item.translations?.tr ?? {}).filter(
            ([, v]) => v !== '' && v !== undefined && !(Array.isArray(v) && v.length === 0)
         )
      );
      return { ...item, translations: Object.keys(tr).length ? { tr } : {} };
   };
   return {
      ...content,
      profile: clean(content.profile),
      projects: content.projects.map(clean),
      experience: content.experience.map(clean),
      skills: content.skills.map(clean),
   };
}
