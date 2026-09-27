'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch, uploadFile } from './api';
import styles from './admin.module.css';

type Version = { id: string; pathname: string; fileName: string; size: number; note: string; uploadedAt: string };
type Slot = { activeId: string | null; versions: Version[] };
type Lang = 'en' | 'tr';

const LANGS: { lang: Lang; title: string; hint: string }[] = [
   { lang: 'en', title: 'English CV', hint: 'Served at /cv/en.pdf and opened from the English site.' },
   { lang: 'tr', title: 'Turkish CV', hint: 'Served at /cv/tr.pdf and opened from /tr. Falls back to English.' },
];

const when = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
const kb = (size: number) => `${Math.max(1, Math.round(size / 1024))} KB`;

function CvSlot({ lang, title, hint, slot, onChange }: { lang: Lang; title: string; hint: string; slot: Slot; onChange: (s: Slot) => void }) {
   const [file, setFile] = useState<File | null>(null);
   const [note, setNote] = useState('');
   const [activate, setActivate] = useState(true);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState('');
   const [inputKey, setInputKey] = useState(0);

   const run = async (action: () => Promise<void>) => {
      setBusy(true);
      setError('');
      try {
         await action();
      } catch (e) {
         setError((e as Error).message);
      } finally {
         setBusy(false);
      }
   };

   const upload = (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) return;
      run(async () => {
         const uploaded = await uploadFile(file, 'cv');
         onChange(
            await adminFetch<Slot>(`cv/${lang}`, {
               method: 'POST',
               body: JSON.stringify({ ...uploaded, note, activate }),
            })
         );
         setFile(null);
         setNote('');
         setInputKey((k) => k + 1);
      });
   };

   const makeActive = (v: Version) =>
      run(async () => onChange(await adminFetch<Slot>(`cv/${lang}/${v.id}`, { method: 'PATCH' })));

   const remove = (v: Version) => {
      if (!window.confirm(`Delete ${v.fileName}? The file is removed for good.`)) return;
      run(async () => {
         await adminFetch(`cv/${lang}/${v.id}`, { method: 'DELETE' });
         onChange({ ...slot, versions: slot.versions.filter((x) => x.id !== v.id) });
      });
   };

   return (
      <section className={styles.cvSlot}>
         <div className={styles.cvHead}>
            <div>
               <h2>{title}</h2>
               <p className={styles.muted}>{hint}</p>
            </div>
            <a className={styles.button} href={`/cv/${lang}.pdf`} target="_blank" rel="noopener noreferrer">
               Open live ↗
            </a>
         </div>

         <form className={styles.cvUpload} onSubmit={upload}>
            <input
               key={inputKey}
               type="file"
               accept="application/pdf"
               onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <input
               placeholder="What changed? (optional)"
               value={note}
               maxLength={200}
               onChange={(e) => setNote(e.target.value)}
            />
            <label className={styles.inlineCheck}>
               <input type="checkbox" checked={activate} onChange={(e) => setActivate(e.target.checked)} />
               Make it live
            </label>
            <button type="submit" className={styles.primary} disabled={!file || busy}>
               {busy ? 'Uploading…' : 'Upload version'}
            </button>
         </form>
         {error && <p className={styles.errorBanner}>{error}</p>}

         {slot.versions.length === 0 ? (
            <p className={styles.muted}>
               No versions yet.{lang === 'en' ? ' The site uses the PDF bundled with the code.' : ' The English CV is used.'}
            </p>
         ) : (
            <ol className={styles.rows}>
               {slot.versions.map((v) => {
                  const live = v.id === slot.activeId;
                  return (
                     <li key={v.id}>
                        <div className={styles.row}>
                           <div className={styles.rowText}>
                              <strong>{v.fileName}</strong>
                              <span>
                                 {when.format(new Date(v.uploadedAt))} · {kb(v.size)}
                                 {v.note && ` · ${v.note}`}
                              </span>
                           </div>
                           {live && <span className={styles.liveBadge}>Live</span>}
                           <div className={styles.rowActions}>
                              <a href={`/files/${v.pathname}`} target="_blank" rel="noopener noreferrer">
                                 View
                              </a>
                              {!live && (
                                 <button type="button" disabled={busy} onClick={() => makeActive(v)}>
                                    Make live
                                 </button>
                              )}
                              {!live && (
                                 <button type="button" className={styles.danger} disabled={busy} onClick={() => remove(v)}>
                                    Delete
                                 </button>
                              )}
                           </div>
                        </div>
                     </li>
                  );
               })}
            </ol>
         )}
      </section>
   );
}

export default function CvManager() {
   const [cv, setCv] = useState<Record<Lang, Slot> | null>(null);
   const [error, setError] = useState('');

   useEffect(() => {
      adminFetch<{ cv: Record<Lang, Slot> }>('content')
         .then((content) => setCv(content.cv))
         .catch((e) => setError(e.message));
   }, []);

   return (
      <div>
         <header className={styles.pageHeader}>
            <div>
               <h1>CV</h1>
               <p>One CV per language. Every upload is kept, so you can switch back to an older version.</p>
            </div>
         </header>
         {error && <p className={styles.errorBanner}>{error}</p>}
         {cv
            ? LANGS.map(({ lang, title, hint }) => (
                 <CvSlot
                    key={lang}
                    lang={lang}
                    title={title}
                    hint={hint}
                    slot={cv[lang]}
                    onChange={(slot) => setCv((prev) => (prev ? { ...prev, [lang]: slot } : prev))}
                 />
              ))
            : !error && <p className={styles.muted}>Loading…</p>}
      </div>
   );
}
