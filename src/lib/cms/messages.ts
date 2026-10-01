import 'server-only';
import { storage, timestampedName } from './storage';

/** One file per message, so two visitors writing at once can't overwrite each other. */
const PREFIX = 'messages/';
const ID = /^[0-9]{13}-[0-9a-f]{8}$/;

export type Message = { id: string; name: string; email: string; body: string; createdAt: string };

export async function saveMessage(message: Omit<Message, 'id' | 'createdAt'>, createdAt = new Date().toISOString()) {
   const data = { ...message, createdAt };
   await storage.put(`${PREFIX}${timestampedName('.json')}`, JSON.stringify(data), 'application/json');
}

export async function listMessages(limit = 200): Promise<Message[]> {
   const files = (await storage.list(PREFIX))
      .filter((f) => f.pathname.endsWith('.json'))
      .sort((a, b) => b.pathname.localeCompare(a.pathname))
      .slice(0, limit);
   const messages = await Promise.all(
      files.map(async (f) => {
         const raw = await storage.readText(f.pathname);
         if (!raw) return null;
         const id = f.pathname.slice(PREFIX.length, -'.json'.length);
         return { id, ...JSON.parse(raw) } as Message;
      })
   );
   return messages.filter((m): m is Message => m !== null);
}

export async function deleteMessage(id: string) {
   if (!ID.test(id)) return false;
   await storage.remove([`${PREFIX}${id}.json`]);
   return true;
}
