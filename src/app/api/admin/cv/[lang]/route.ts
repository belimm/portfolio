import { randomUUID } from 'crypto';
import { z } from 'zod';
import { adminRoute, json } from '../../../../../lib/auth/admin-route';
import { NotFoundError, updateContent } from '../../../../../lib/cms/repository';

type Ctx = { params: Promise<{ lang: string }> };

const Body = z.object({
   pathname: z.string().startsWith('uploads/cv/').max(300),
   fileName: z.string().trim().min(1).max(200),
   size: z.number().int().nonnegative(),
   note: z.string().trim().max(200).default(''),
   activate: z.boolean().default(true),
});

/** Registers an uploaded PDF as a new CV version for a language. */
export const POST = adminRoute<Ctx>(async (req, { params }) => {
   const { lang } = await params;
   if (lang !== 'en' && lang !== 'tr') throw new NotFoundError('Unknown language');
   const { activate, ...file } = Body.parse(await req.json());
   const version = { id: randomUUID().slice(0, 8), ...file, uploadedAt: new Date().toISOString() };
   const content = await updateContent(`Uploaded a ${lang.toUpperCase()} CV: ${file.fileName}`, (draft) => {
      draft.cv[lang].versions.unshift(version);
      if (activate || !draft.cv[lang].activeId) draft.cv[lang].activeId = version.id;
   });
   return json(content.cv[lang], 201);
});
