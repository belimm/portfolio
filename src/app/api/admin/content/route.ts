import { adminRoute, json } from '../../../../lib/auth/admin-route';
import { loadContent } from '../../../../lib/cms/repository';

export const GET = adminRoute(async () => json(await loadContent()));
