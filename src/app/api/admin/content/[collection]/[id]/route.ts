import { adminRoute, json } from '../../../../../../lib/auth/admin-route';
import { NotFoundError, updateContent } from '../../../../../../lib/cms/repository';
import { COLLECTIONS, isCollection } from '../../../../../../lib/cms/schema';

type Ctx = { params: Promise<{ collection: string; id: string }> };

export const PUT = adminRoute<Ctx>(async (req, { params }) => {
   const { collection, id } = await params;
   if (!isCollection(collection)) throw new NotFoundError('Unknown collection');
   const item = { id, ...COLLECTIONS[collection].parse(await req.json()) };
   const label = 'title' in item ? item.title : item.name;
   await updateContent(`Edited “${label}” in ${collection}`, (draft) => {
      const list = draft[collection] as (typeof item)[];
      const index = list.findIndex((x) => x.id === id);
      if (index === -1) throw new NotFoundError('Item not found');
      list[index] = item;
   });
   return json(item);
});

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
   const { collection, id } = await params;
   if (!isCollection(collection)) throw new NotFoundError('Unknown collection');
   await updateContent(`Deleted an item from ${collection}`, (draft) => {
      const list = draft[collection] as { id: string }[];
      const index = list.findIndex((x) => x.id === id);
      if (index === -1) throw new NotFoundError('Item not found');
      list.splice(index, 1);
   });
   return new Response(null, { status: 204 });
});
