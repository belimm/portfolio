'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from './api';
import styles from './admin.module.css';

type Message = {
   id: number;
   name: string;
   email: string;
   body: string;
   read: boolean;
   created_at: string;
};

const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function MessagesInbox() {
   const [messages, setMessages] = useState<Message[] | null>(null);
   const [error, setError] = useState('');

   useEffect(() => {
      adminFetch<Message[]>('messages')
         .then(setMessages)
         .catch((e) => setError(e.message));
   }, []);

   const setRead = async (m: Message, read: boolean) => {
      try {
         const updated = await adminFetch<Message>(`messages/${m.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ read }),
         });
         setMessages((prev) => prev?.map((x) => (x.id === m.id ? updated : x)) ?? null);
         window.dispatchEvent(new Event('admin:messages'));
      } catch (e) {
         setError((e as Error).message);
      }
   };

   const remove = async (m: Message) => {
      if (!window.confirm(`Delete the message from ${m.name}?`)) return;
      try {
         await adminFetch(`messages/${m.id}`, { method: 'DELETE' });
         setMessages((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
         window.dispatchEvent(new Event('admin:messages'));
      } catch (e) {
         setError((e as Error).message);
      }
   };

   return (
      <div>
         <header className={styles.pageHeader}>
            <div>
               <h1>Messages</h1>
               <p>Everything sent through the contact form.</p>
            </div>
         </header>
         {error && <p className={styles.errorBanner}>{error}</p>}
         {messages === null ? (
            !error && <p className={styles.muted}>Loading…</p>
         ) : messages.length === 0 ? (
            <p className={styles.muted}>No messages yet.</p>
         ) : (
            <ul className={styles.messages}>
               {messages.map((m) => (
                  <li key={m.id} className={m.read ? undefined : styles.unread}>
                     <div className={styles.messageHead}>
                        <strong>{m.name}</strong>
                        <a href={`mailto:${m.email}?subject=Re: your message`}>{m.email}</a>
                        <time>{when.format(new Date(m.created_at))}</time>
                     </div>
                     <p className={styles.messageBody}>{m.body}</p>
                     <div className={styles.rowActions}>
                        <a
                           className={styles.button}
                           href={`mailto:${m.email}?subject=Re: your message`}
                           onClick={() => !m.read && setRead(m, true)}>
                           Reply
                        </a>
                        <button type="button" onClick={() => setRead(m, !m.read)}>
                           Mark as {m.read ? 'unread' : 'read'}
                        </button>
                        <button type="button" className={styles.danger} onClick={() => remove(m)}>
                           Delete
                        </button>
                     </div>
                  </li>
               ))}
            </ul>
         )}
      </div>
   );
}
