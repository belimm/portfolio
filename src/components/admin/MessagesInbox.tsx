'use client';

import { useEffect, useState } from 'react';
import { adminFetch, INBOX_SEEN_KEY, inboxSeenAt } from './api';
import styles from './admin.module.css';

type Message = { id: string; name: string; email: string; body: string; createdAt: string };

const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function MessagesInbox() {
   const [messages, setMessages] = useState<Message[] | null>(null);
   const [seenAt, setSeenAt] = useState('');
   const [error, setError] = useState('');

   useEffect(() => {
      setSeenAt(inboxSeenAt());
      adminFetch<Message[]>('messages')
         .then((list) => {
            setMessages(list);
            // Opening the inbox marks everything as seen (in this browser).
            if (list[0]) {
               try {
                  localStorage.setItem(INBOX_SEEN_KEY, list[0].createdAt);
               } catch {}
               window.dispatchEvent(new Event('admin:messages'));
            }
         })
         .catch((e) => setError(e.message));
   }, []);

   const remove = async (m: Message) => {
      if (!window.confirm(`Delete the message from ${m.name}?`)) return;
      try {
         await adminFetch(`messages/${m.id}`, { method: 'DELETE' });
         setMessages((prev) => prev?.filter((x) => x.id !== m.id) ?? null);
      } catch (e) {
         setError((e as Error).message);
      }
   };

   return (
      <div>
         <header className={styles.pageHeader}>
            <div>
               <h1>Messages</h1>
               <p>Everything sent through the contact form, newest first.</p>
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
                  <li key={m.id} className={m.createdAt > seenAt ? styles.unread : undefined}>
                     <div className={styles.messageHead}>
                        <strong>{m.name}</strong>
                        <a href={`mailto:${m.email}?subject=Re: your message`}>{m.email}</a>
                        <time>{when.format(new Date(m.createdAt))}</time>
                     </div>
                     <p className={styles.messageBody}>{m.body}</p>
                     <div className={styles.rowActions}>
                        <a className={styles.button} href={`mailto:${m.email}?subject=Re: your message`}>
                           Reply
                        </a>
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
