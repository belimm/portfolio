import fallbackEn from './fallback-content.en.json';
import fallbackTr from './fallback-content.tr.json';
import { Locale } from './i18n';

export type Profile = {
   name: string;
   pronunciation: string;
   role: string;
   location: string;
   intro: string;
   about: string;
   email: string;
   github_url: string;
   linkedin_url: string;
   cv_url: string;
   available: boolean;
   availability_note: string;
};

export type Project = {
   id: number;
   title: string;
   subtitle: string;
   description: string;
   year: string;
   image_url: string;
   link: string;
   tags: string[];
};

export type ExperienceItem = {
   id: number;
   kind: 'work' | 'education';
   title: string;
   organization: string;
   location: string;
   start: string;
   end: string;
   summary: string;
   highlights: string[];
};

export type SkillGroup = {
   id: number;
   name: string;
   items: string[];
};

export type Content = {
   lang: Locale;
   profile: Profile;
   projects: Project[];
   experience: ExperienceItem[];
   skills: SkillGroup[];
   updated_at: string | null;
};

export const CONTENT_TAG = 'content';

const fallbacks: Record<Locale, Content> = {
   en: fallbackEn as Content,
   tr: fallbackTr as Content,
};

/**
 * Loads the page content from the portfolio API, already translated to `lang`.
 *
 * During the build (the API is usually not reachable from the build container) and in dev we
 * fall back to the bundled snapshot. At runtime in production a failed fetch throws instead, so
 * Next keeps serving the last good render rather than caching the snapshot over it.
 */
export async function getContent(lang: Locale): Promise<Content> {
   const fallback = fallbacks[lang];
   const apiUrl = process.env.API_URL;
   const canFallBack =
      process.env.NEXT_PHASE === 'phase-production-build' ||
      process.env.NODE_ENV !== 'production';

   if (!apiUrl) return fallback;

   try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/api/public/content?lang=${lang}`, {
         next: { revalidate: 300, tags: [CONTENT_TAG] },
         signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`Portfolio API responded ${res.status}`);
      const data = (await res.json()) as Content;
      if (!data.profile) return { ...data, profile: fallback.profile };
      return data;
   } catch (error) {
      if (canFallBack) {
         console.warn('Using bundled content:', (error as Error).message);
         return fallback;
      }
      throw error;
   }
}
