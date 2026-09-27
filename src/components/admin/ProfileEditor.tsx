'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from './api';
import { Field, FieldDef, TranslationFields, Translations } from './fields';
import styles from './admin.module.css';

const FIELDS: FieldDef[] = [
   { name: 'name', label: 'Name', type: 'text', required: true },
   { name: 'role', label: 'Role', type: 'text', translatable: true },
   { name: 'location', label: 'Location', type: 'text', translatable: true },
   { name: 'pronunciation', label: 'Pronunciation', type: 'text' },
   {
      name: 'intro',
      label: 'Headline',
      type: 'textarea',
      hint: 'Wrap words in ==double equals== to highlight them',
      translatable: true,
   },
   { name: 'about', label: 'About', type: 'textarea', translatable: true },
   { name: 'email', label: 'Email', type: 'text' },
   { name: 'github_url', label: 'GitHub URL', type: 'text' },
   { name: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
   { name: 'cv_url', label: 'CV', type: 'file', accept: 'application/pdf', hint: 'PDF, opens in the CV viewer' },
   { name: 'available', label: 'Show availability note', type: 'checkbox' },
   { name: 'availability_note', label: 'Availability note', type: 'text', wide: true, translatable: true },
];

export default function ProfileEditor() {
   const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState('');
   const [notice, setNotice] = useState('');

   useEffect(() => {
      adminFetch<Record<string, unknown>>('profile')
         .then(setProfile)
         .catch((e) => setError(e.message));
   }, []);

   const save = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile) return;
      setBusy(true);
      setError('');
      try {
         const body = {
            ...Object.fromEntries(FIELDS.map((f) => [f.name, profile[f.name]])),
            translations: profile.translations ?? {},
         };
         setProfile(await adminFetch('profile', { method: 'PUT', body: JSON.stringify(body) }));
         setNotice('Saved. The site is updated.');
         setTimeout(() => setNotice(''), 2500);
      } catch (err) {
         setError((err as Error).message);
      } finally {
         setBusy(false);
      }
   };

   return (
      <div>
         <header className={styles.pageHeader}>
            <div>
               <h1>Profile</h1>
               <p>Header, hero and contact details.</p>
            </div>
         </header>
         {error && <p className={styles.errorBanner}>{error}</p>}
         {notice && <p className={styles.notice}>{notice}</p>}
         {profile ? (
            <form className={styles.editor} onSubmit={save}>
               <div className={styles.grid}>
                  {FIELDS.map((def) => (
                     <Field
                        key={def.name}
                        def={def}
                        value={profile[def.name]}
                        onChange={(value) => setProfile((p) => ({ ...p, [def.name]: value }))}
                     />
                  ))}
               </div>
               <TranslationFields
                  defs={FIELDS}
                  english={profile}
                  translations={profile.translations as Translations | undefined}
                  keyPrefix="profile"
                  onChange={(translations) => setProfile((p) => ({ ...p, translations }))}
               />
               <div className={styles.formFooter}>
                  <button type="submit" className={styles.primary} disabled={busy}>
                     {busy ? 'Saving…' : 'Save'}
                  </button>
               </div>
            </form>
         ) : (
            !error && <p className={styles.muted}>Loading…</p>
         )}
      </div>
   );
}
