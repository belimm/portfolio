import { adminRoute, json } from '../../../../../lib/auth/admin-route';
import { updateContent } from '../../../../../lib/cms/repository';
import { ProfileSchema } from '../../../../../lib/cms/schema';

export const PUT = adminRoute(async (req) => {
   const profile = ProfileSchema.parse(await req.json());
   const content = await updateContent('Updated the profile', (draft) => {
      draft.profile = profile;
   });
   return json(content.profile);
});
