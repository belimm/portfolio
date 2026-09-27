import { randomUUID } from 'crypto';
import { adminRoute, json } from '../../../../../lib/auth/admin-route';
import { NotFoundError, updateContent } from '../../../../../lib/cms/repository';
import { COLLECTIONS, isCollection } from '../../../../../lib/cms/schema';

type Ctx = { params: Promise<{ collection: string }> };

export const POST = adminRoute<Ctx>(async (req, { params }) => {
   const { collection } = await params;
   if (!isCollection(collection)) throw new NotFoundError('Unknown collection');
   const item = { id: randomUUID().slice(0, 8), ...COLLECTIONS[collection].parse(await req.json()) };
   const label = 'title' in item ? item.title : item.name;
   await updateContent(`Added “${label}” to ${collection}`, (draft) => {
      (draft[collection] as (typeof item)[]).push(item);
   });
   return json(item, 201);
});
