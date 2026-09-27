'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminFetch } from './api';
import styles from './admin.module.css';

type Entry = { pathname: string; savedAt: string; note: string };

const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'medium' });

export default function HistoryPanel() {
   const [entries, setEntries] = useState<Entry[] | null>(null);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState('');
   const [notice, setNotice] = useState('');

   const load = useCallback(() => {
      adminFetch<Entry[]>('history')
         .then(setEntries)
         .catch((e) => setError(e.message));
   }, []);

   useEffect(load, [load]);

   const restore = async (entry: Entry) => {
      if (!window.confirm(`Bring back the content as it was on ${when.format(new Date(entry.savedAt))}?`)) return;
      setBusy(true);
      setError('');
      try {
         await adminFetch('history/restore', { method: 'POST', body: JSON.stringify({ pathname: entry.pathname }) });
         setNotice('Restored. The site is updated.');
         setTimeout(() => setNotice(''), 2500);
         load();
      } catch (e) {
         setError((e as Error).message);
      } finally {
         setBusy(false);
      }
   };

   return (
      <div>
         <header className={styles.pageHeader}>
            <div>
               <h1>History</h1>
               <p>Every save is kept (the last 40). Restoring adds a new save, so nothing is lost.</p>
            </div>
         </header>
         {error && <p className={styles.errorBanner}>{error}</p>}
         {notice && <p className={styles.notice}>{notice}</p>}
         {entries === null ? (
            !error && <p className={styles.muted}>Loading…</p>
         ) : entries.length === 0 ? (
            <p className={styles.muted}>No saves yet. The site shows the built-in content until the first save.</p>
         ) : (
            <ol className={styles.rows}>
               {entries.map((entry, index) => (
                  <li key={entry.pathname}>
                     <div className={styles.row}>
                        <div className={styles.rowText}>
                           <strong>{entry.note || 'Saved'}</strong>
                           <span>{when.format(new Date(entry.savedAt))}</span>
                        </div>
                        {index === 0 ? (
                           <span className={styles.liveBadge}>Live</span>
                        ) : (
                           <div className={styles.rowActions}>
                              <button type="button" disabled={busy} onClick={() => restore(entry)}>
                                 Restore
                              </button>
                           </div>
                        )}
                     </div>
                  </li>
               ))}
            </ol>
         )}
      </div>
   );
}
