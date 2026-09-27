import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ConflictError, NotFoundError } from '../cms/repository';
import { isSameOrigin } from '../request';
import { SESSION_COOKIE, verifySession } from './session';

export const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

function describe(error: ZodError) {
   return error.issues.map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message)).join('; ');
}

/**
 * Wraps every /api/admin handler: same-origin check for writes, session check (middleware
 * checks too, this is the second line), and consistent error responses.
 */
export function adminRoute<Ctx>(handler: (req: NextRequest, ctx: Ctx, admin: string) => Promise<Response>) {
   return async (req: NextRequest, ctx: Ctx) => {
      if (req.method !== 'GET' && !isSameOrigin(req)) return json({ detail: 'Forbidden' }, 403);
      const admin = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
      if (!admin) return json({ detail: 'Not signed in' }, 401);
      try {
         return await handler(req, ctx, admin);
      } catch (error) {
         if (error instanceof ZodError) return json({ detail: describe(error) }, 422);
         if (error instanceof NotFoundError) return json({ detail: error.message }, 404);
         if (error instanceof ConflictError) return json({ detail: error.message }, 409);
         console.error('Admin request failed:', error);
         return json({ detail: 'Something went wrong on the server' }, 500);
      }
   };
}
