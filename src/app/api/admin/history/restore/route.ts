import { z } from 'zod';
import { adminRoute, json } from '../../../../../lib/auth/admin-route';
import { restoreSnapshot } from '../../../../../lib/cms/repository';

const Body = z.object({ pathname: z.string().max(200) });

export const POST = adminRoute(async (req) => {
   const { pathname } = Body.parse(await req.json());
   await restoreSnapshot(pathname);
   return json({ ok: true });
});
