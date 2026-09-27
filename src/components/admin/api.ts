'use client';

/** Client-side calls to our own /api/admin proxy. The session lives in an httpOnly cookie. */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
   const isForm = init.body instanceof FormData;
   const res = await fetch(`/api/admin/${path}`, {
      ...init,
      headers: isForm ? init.headers : { 'Content-Type': 'application/json', ...init.headers },
      cache: 'no-store',
   });

   if (res.status === 401) {
      window.location.assign('/admin/login');
      throw new Error('Signed out');
   }
   if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(formatDetail(data.detail) || `Request failed (${res.status})`);
   }
   return (res.status === 204 ? undefined : await res.json()) as T;
}

/** FastAPI validation errors come back as a list; turn them into one readable line. */
function formatDetail(detail: unknown): string {
   if (typeof detail === 'string') return detail;
   if (Array.isArray(detail)) {
      return detail
         .map((d: { loc?: (string | number)[]; msg?: string }) => {
            const field = d.loc?.filter((p) => p !== 'body').join('.');
            return field ? `${field}: ${d.msg}` : d.msg;
         })
         .join('; ');
   }
   return '';
}

export type Uploaded = { pathname: string; url: string; size: number; fileName: string };

export async function uploadFile(file: File, kind: 'images' | 'cv' = 'images'): Promise<Uploaded> {
   const body = new FormData();
   body.append('file', file);
   body.append('kind', kind);
   return adminFetch<Uploaded>('upload', { method: 'POST', body });
}

/** Unread = newer than the last time the inbox was opened in this browser. */
export const INBOX_SEEN_KEY = 'admin:inbox-seen';

export function inboxSeenAt() {
   try {
      return localStorage.getItem(INBOX_SEEN_KEY) ?? '';
   } catch {
      return '';
   }
}
