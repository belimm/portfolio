import { adminRoute, json } from '../../../../../../lib/auth/admin-route';
import { ConflictError, NotFoundError, updateContent } from '../../../../../../lib/cms/repository';
import { storage } from '../../../../../../lib/cms/storage';

type Ctx = { params: Promise<{ lang: string; id: string }> };

function language(lang: string) {
   if (lang !== 'en' && lang !== 'tr') throw new NotFoundError('Unknown language');
   return lang;
}

/** Makes this version the one /cv/<lang>.pdf serves. */
export const PATCH = adminRoute<Ctx>(async (_req, { params }) => {
   const { lang, id } = await params;
   const l = language(lang);
   const content = await updateContent(`Switched the ${l.toUpperCase()} CV version`, (draft) => {
      if (!draft.cv[l].versions.some((v) => v.id === id)) throw new NotFoundError('Version not found');
      draft.cv[l].activeId = id;
   });
   return json(content.cv[l]);
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
   const { lang, id } = await params;
   const l = language(lang);
   let pathname = '';
   await updateContent(`Deleted a ${l.toUpperCase()} CV version`, (draft) => {
      const version = draft.cv[l].versions.find((v) => v.id === id);
      if (!version) throw new NotFoundError('Version not found');
      if (draft.cv[l].activeId === id) throw new ConflictError('Activate another version before deleting this one');
      pathname = version.pathname;
      draft.cv[l].versions = draft.cv[l].versions.filter((v) => v.id !== id);
   });
   // Older content snapshots may still reference the file; restoring one of those would show a
   // missing CV, which the /cv route handles by falling back.
   await storage.remove([pathname]);
   return new Response(null, { status: 204 });
});
