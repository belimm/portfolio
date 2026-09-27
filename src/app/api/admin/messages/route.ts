import { adminRoute, json } from '../../../../lib/auth/admin-route';
import { listMessages } from '../../../../lib/cms/messages';

export const GET = adminRoute(async () => json(await listMessages()));
