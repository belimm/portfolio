import { adminRoute, json } from '../../../../lib/auth/admin-route';
import { listHistory } from '../../../../lib/cms/repository';

export const GET = adminRoute(async () => json(await listHistory()));
