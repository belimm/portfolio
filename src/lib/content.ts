import 'server-only';
import { unstable_cache } from 'next/cache';
import { CONTENT_TAG, loadLive } from './cms/repository';
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
   id: string;
   title: string;
   subtitle: string;
   description: string;
   year: string;
   image_url: string;
   link: string;
   tags: string[];
};

export type ExperienceItem = {
   id: string;
   kind: 'work' | 'education';
   title: string;
   organization: string;
   link: string;
   location: string;
   start: string;
   end: string;
   summary: string;
   highlights: string[];
};

export type SkillGroup = { id: string; name: string; items: string[] };

export type Content = {
   lang: Locale;
   profile: Profile;
   projects: Project[];
   experience: ExperienceItem[];
   skills: SkillGroup[];
   updated_at: string | null;
};

/** Cached until an admin save calls revalidateTag(CONTENT_TAG). */
export const getPublished = unstable_cache(loadLive, ['site-content'], {
   tags: [CONTENT_TAG],
   revalidate: 3600,
});

/** Overlay non-empty translations for `lang` on the English fields. */
function localize<T extends { translations?: { tr?: Record<string, unknown> } }>(item: T, lang: Locale) {
   const { translations, ...base } = item;
   if (lang === 'en') return base;
   return { ...base, ...(translations?.[lang] ?? {}) } as typeof base;
}

export async function getContent(lang: Locale): Promise<Content> {
   const { content, savedAt } = await getPublished();
   return {
      lang,
      // /cv/<lang>.pdf serves the active CV for that language, falling back to English.
      profile: { ...localize(content.profile, lang), cv_url: `/cv/${lang}.pdf` },
      projects: content.projects.filter((p) => p.visible).map((p) => localize(p, lang)),
      experience: content.experience.filter((e) => e.visible).map((e) => localize(e, lang)),
      skills: content.skills.map((s) => localize(s, lang)),
      updated_at: savedAt,
   };
}
