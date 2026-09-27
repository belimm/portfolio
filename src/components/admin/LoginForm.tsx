'use client';

import React, { useState } from 'react';
import styles from './admin.module.css';

export default function LoginForm({ needsCode }: { needsCode: boolean }) {
   const [error, setError] = useState('');
   const [busy, setBusy] = useState(false);

   const submit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      setBusy(true);
      setError('');
      const res = await fetch('/api/admin/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            email: form.get('email'),
            password: form.get('password'),
            code: form.get('code') ?? undefined,
         }),
      }).catch(() => null);
      if (res?.ok) {
         window.location.assign('/admin');
         return;
      }
      const data = await res?.json().catch(() => ({}));
      setError(data?.detail || 'Could not reach the server');
      setBusy(false);
   };

   return (
      <main className={styles.loginPage}>
         <form className={styles.loginCard} onSubmit={submit}>
            <h1>Sign in</h1>
            <label className={styles.field}>
               <span className={styles.label}>Email</span>
               <input name="email" type="email" autoComplete="username" required autoFocus />
            </label>
            <label className={styles.field}>
               <span className={styles.label}>Password</span>
               <input name="password" type="password" autoComplete="current-password" required />
            </label>
            {needsCode && (
               <label className={styles.field}>
                  <span className={styles.label}>
                     Authenticator code <span className={styles.hint}>6 digits</span>
                  </span>
                  <input
                     name="code"
                     inputMode="numeric"
                     autoComplete="one-time-code"
                     pattern="[0-9]{6}"
                     maxLength={6}
                     required
                  />
               </label>
            )}
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primary} disabled={busy}>
               {busy ? 'Signing in…' : 'Sign in'}
            </button>
         </form>
      </main>
   );
}
