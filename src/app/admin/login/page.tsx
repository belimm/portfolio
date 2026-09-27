'use client';

import React, { useState } from 'react';
import styles from '../../../components/admin/admin.module.css';

export default function LoginPage() {
   const [error, setError] = useState('');
   const [busy, setBusy] = useState(false);

   const submit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const password = new FormData(e.currentTarget).get('password');
      setBusy(true);
      setError('');
      const res = await fetch('/api/admin/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ password }),
      }).catch(() => null);
      if (res?.ok) {
         window.location.assign('/admin');
         return;
      }
      const data = await res?.json().catch(() => ({}));
      setError(data?.detail || 'Could not reach the API');
      setBusy(false);
   };

   return (
      <main className={styles.loginPage}>
         <form className={styles.loginCard} onSubmit={submit}>
            <h1>Sign in</h1>
            <label className={styles.field}>
               <span className={styles.label}>Password</span>
               <input name="password" type="password" autoComplete="current-password" required autoFocus />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primary} disabled={busy}>
               {busy ? 'Signing in…' : 'Sign in'}
            </button>
         </form>
      </main>
   );
}
