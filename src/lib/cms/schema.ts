import { z } from 'zod';

/**
 * The whole site's editable content, stored as one JSON snapshot per save.
 * English lives in the regular fields; Turkish (optional, per field) under `translations.tr`.
 */

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1, 'Required');

/** Links end up in href/src attributes: only allow site paths and http(s), never javascript: etc. */
const link = text(500).refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//i.test(v), {
   message: 'Must start with / or http(s)://',
});
const email = text(200).refine((v) => v === '' || z.email().safeParse(v).success, { message: 'Invalid email' });
const id = z.string().min(1).max(40);

const profileTr = z
   .object({ role: text(160), location: text(120), intro: text(2000), about: text(5000), availability_note: text(200) })
   .partial();

export const ProfileSchema = z.object({
   name: required(120),
   pronunciation: text(60).default(''),
   role: text(160).default(''),
   location: text(120).default(''),
   intro: text(2000).default(''),
   about: text(5000).default(''),
   email: email.default(''),
   github_url: link.default(''),
   linkedin_url: link.default(''),
   available: z.boolean().default(true),
   availability_note: text(200).default(''),
   translations: z.object({ tr: profileTr }).partial().default({}),
});

const projectFields = {
   title: required(200),
   subtitle: text(200).default(''),
   description: text(5000).default(''),
   year: text(20).default(''),
   image_url: link.default(''),
   link: link.default(''),
   tags: z.array(required(40)).max(20).default([]),
   visible: z.boolean().default(true),
   translations: z
      .object({ tr: z.object({ subtitle: text(200), description: text(5000) }).partial() })
      .partial()
      .default({}),
};
export const ProjectInput = z.object(projectFields);
export const ProjectSchema = z.object({ id, ...projectFields });

const experienceFields = {
   kind: z.enum(['work', 'education']).default('work'),
   title: required(200),
   organization: text(200).default(''),
   /** The company's or school's website; makes the entry's title a link. */
   link: link.default(''),
   location: text(200).default(''),
   start: text(40).default(''),
   end: text(40).default(''),
   summary: text(5000).default(''),
   highlights: z.array(required(500)).max(20).default([]),
   visible: z.boolean().default(true),
   translations: z
      .object({
         tr: z
            .object({
               title: text(200),
               location: text(200),
               start: text(40),
               end: text(40),
               summary: text(5000),
               highlights: z.array(required(500)).max(20),
            })
            .partial(),
      })
      .partial()
      .default({}),
};
export const ExperienceInput = z.object(experienceFields);
export const ExperienceSchema = z.object({ id, ...experienceFields });

const skillFields = {
   name: required(120),
   items: z.array(required(60)).max(50).default([]),
   translations: z.object({ tr: z.object({ name: text(120) }).partial() }).partial().default({}),
};
export const SkillGroupInput = z.object(skillFields);
export const SkillGroupSchema = z.object({ id, ...skillFields });

export const CvVersionSchema = z.object({
   id,
   pathname: required(300),
   fileName: required(200),
   size: z.number().int().nonnegative(),
   note: text(200).default(''),
   uploadedAt: z.string(),
});

const CvSlotSchema = z.object({
   activeId: id.nullable().default(null),
   versions: z.array(CvVersionSchema).default([]),
});

export const SiteContentSchema = z.object({
   schemaVersion: z.literal(1),
   profile: ProfileSchema,
   projects: z.array(ProjectSchema).max(100),
   experience: z.array(ExperienceSchema).max(100),
   skills: z.array(SkillGroupSchema).max(50),
   cv: z.object({ en: CvSlotSchema, tr: CvSlotSchema }),
});

export type SiteContent = z.infer<typeof SiteContentSchema>;
export type CvVersion = z.infer<typeof CvVersionSchema>;
export type CvLang = keyof SiteContent['cv'];

/** Collections editable through the generic admin editor. */
export const COLLECTIONS = {
   projects: ProjectInput,
   experience: ExperienceInput,
   skills: SkillGroupInput,
} as const;
export type CollectionName = keyof typeof COLLECTIONS;
export const isCollection = (name: string): name is CollectionName => name in COLLECTIONS;
