import { z } from 'zod';
import { adminRoute, json } from '../../../../../../lib/auth/admin-route';
import { NotFoundError, updateContent } from '../../../../../../lib/cms/repository';
import { isCollection } from '../../../../../../lib/cms/schema';

type Ctx = { params: Promise<{ collection: string }> };
const Body = z.object({ ids: z.array(z.string()).max(100) });

export const POST = adminRoute<Ctx>(async (req, { params }) => {
   const { collection } = await params;
   if (!isCollection(collection)) throw new NotFoundError('Unknown collection');
   const { ids } = Body.parse(await req.json());
   const content = await updateContent(`Reordered ${collection}`, (draft) => {
      const list = draft[collection] as { id: string }[];
      const byId = new Map(list.map((x) => [x.id, x]));
      if (ids.length !== list.length || new Set(ids).size !== ids.length || ids.some((id) => !byId.has(id))) {
         throw new z.ZodError([{ code: 'custom', path: ['ids'], message: 'Must list every item exactly once', input: ids }]);
      }
      (draft as Record<string, unknown>)[collection] = ids.map((id) => byId.get(id)!);
   });
   return json(content[collection]);
});
