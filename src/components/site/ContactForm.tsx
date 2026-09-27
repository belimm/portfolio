'use client';

import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { useTerminal } from '../../contexts/TerminalContext';
import type { Dictionary } from '../../lib/i18n';
import styles from './ContactForm.module.css';

type Status = { kind: 'idle' | 'sending' | 'sent' | 'error'; text?: string };

const emailjsConfig = {
   service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
   template: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
   key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

class InboxError extends Error {
   constructor(public status: number) {
      super(`Inbox responded ${status}`);
   }
}

async function saveToInbox(fields: Record<string, string>) {
   const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
   });
   if (!res.ok) throw new InboxError(res.status);
}

async function notifyByEmail(fields: Record<string, string>) {
   if (!emailjsConfig.service || !emailjsConfig.template || !emailjsConfig.key) {
      throw new Error('EmailJS not configured');
   }
   await emailjs.send(
      emailjsConfig.service,
      emailjsConfig.template,
      { name: fields.name, email: fields.email, message: fields.body, time: new Date().toLocaleString() },
      emailjsConfig.key
   );
}

export default function ContactForm({ t }: { t: Dictionary['contact'] }) {
   const { addTerminalEntry } = useTerminal();
   const [status, setStatus] = useState<Status>({ kind: 'idle' });

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const fields = Object.fromEntries(new FormData(form)) as Record<string, string>;
      setStatus({ kind: 'sending' });

      // The inbox is the source of truth; the email is a heads-up. Either one landing is a success.
      const [saved, mailed] = await Promise.allSettled([saveToInbox(fields), notifyByEmail(fields)]);

      if (saved.status === 'fulfilled' || mailed.status === 'fulfilled') {
         form.reset();
         setStatus({ kind: 'sent', text: t.sent });
         addTerminalEntry({ command: `mail --from ${fields.email}`, output: t.delivered });
      } else {
         const rateLimited =
            saved.status === 'rejected' && saved.reason instanceof InboxError && saved.reason.status === 429;
         setStatus({ kind: 'error', text: rateLimited ? t.tooMany : t.failed });
      }
   };

   return (
      <form className={styles.form} onSubmit={handleSubmit}>
         <div className={styles.row}>
            <label className={styles.field}>
               <span>{t.name}</span>
               <input name="name" required maxLength={120} autoComplete="name" />
            </label>
            <label className={styles.field}>
               <span>{t.email}</span>
               <input name="email" type="email" required maxLength={200} autoComplete="email" />
            </label>
         </div>
         <label className={styles.field}>
            <span>{t.message}</span>
            <textarea name="body" required maxLength={5000} rows={5} />
         </label>
         {/* Honeypot for bots; hidden from people and screen readers. */}
         <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className={styles.trap}
         />
         <div className={styles.footer}>
            <button type="submit" disabled={status.kind === 'sending'}>
               {status.kind === 'sending' ? t.sending : t.send}
            </button>
            {status.text && (
               <p
                  role="status"
                  className={status.kind === 'error' ? styles.error : styles.success}>
                  {status.text}
               </p>
            )}
         </div>
      </form>
   );
}
