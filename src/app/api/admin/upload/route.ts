import { adminRoute, json } from '../../../../lib/auth/admin-route';
import { saveUpload, UploadError } from '../../../../lib/cms/uploads';

export const POST = adminRoute(async (req) => {
   const form = await req.formData().catch(() => null);
   const file = form?.get('file');
   const kind = form?.get('kind') === 'cv' ? 'cv' : 'images';
   if (!(file instanceof File)) return json({ detail: 'No file received' }, 400);
   try {
      return json(await saveUpload(file, kind), 201);
   } catch (error) {
      if (error instanceof UploadError) return json({ detail: error.message }, 415);
      throw error;
   }
});
