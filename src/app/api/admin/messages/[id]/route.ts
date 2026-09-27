import { adminRoute, json } from '../../../../../lib/auth/admin-route';
import { deleteMessage } from '../../../../../lib/cms/messages';

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = adminRoute<Ctx>(async (_req, { params }) => {
   const { id } = await params;
   if (!(await deleteMessage(id))) return json({ detail: 'Message not found' }, 404);
   return new Response(null, { status: 204 });
});
