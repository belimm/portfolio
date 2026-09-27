'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from './api';
import { Field, FieldDef, TranslationFields, Translations } from './fields';
import styles from './admin.module.css';

type Item = { id: number; sort_order: number; visible?: boolean } & Record<string, unknown>;

type CollectionEditorProps = {
   endpoint: 'projects' | 'experience' | 'skills';
   title: string;
   description: string;
   fields: FieldDef[];
   blank: Record<string, unknown>;
   summarize: (item: Item) => { title: string; meta?: string };
};

/** List, reorder, create, edit and delete one collection. Changes go live on save. */
export default function CollectionEditor({
   endpoint,
   title,
   description,
   fields,
   blank,
   summarize,
}: CollectionEditorProps) {
   const [items, setItems] = useState<Item[] | null>(null);
   const [editing, setEditing] = useState<number | 'new' | null>(null);
   const [draft, setDraft] = useState<Record<string, unknown>>({});
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState('');
   const [notice, setNotice] = useState('');

   useEffect(() => {
      adminFetch<Item[]>(endpoint)
         .then(setItems)
         .catch((e) => setError(e.message));
   }, [endpoint]);

   const flash = (text: string) => {
      setNotice(text);
      setTimeout(() => setNotice(''), 2500);
   };

   const startEdit = (item: Item | null) => {
      setError('');
      setEditing(item ? item.id : 'new');
      setDraft(item ? { ...item } : { ...blank });
   };

   const payload = () => ({
      ...Object.fromEntries(fields.map((f) => [f.name, draft[f.name] ?? blank[f.name]])),
      translations: draft.translations ?? {},
   });

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

   const save = (e: React.FormEvent) => {
      e.preventDefault();
      run(async () => {
         if (editing === 'new') {
            const created = await adminFetch<Item>(endpoint, {
               method: 'POST',
               body: JSON.stringify(payload()),
            });
            setItems((prev) => [...(prev ?? []), created]);
         } else {
            const updated = await adminFetch<Item>(`${endpoint}/${editing}`, {
               method: 'PUT',
               body: JSON.stringify(payload()),
            });
            setItems((prev) => prev?.map((i) => (i.id === updated.id ? updated : i)) ?? null);
         }
         setEditing(null);
         flash('Saved. The site is updated.');
      });
   };

   const remove = (item: Item) => {
      if (!window.confirm(`Delete “${summarize(item).title}”? This can't be undone.`)) return;
      run(async () => {
         await adminFetch(`${endpoint}/${item.id}`, { method: 'DELETE' });
         setItems((prev) => prev?.filter((i) => i.id !== item.id) ?? null);
         setEditing(null);
         flash('Deleted.');
      });
   };

   const move = (index: number, delta: number) => {
      if (!items) return;
      const next = [...items];
      const [moved] = next.splice(index, 1);
      next.splice(index + delta, 0, moved);
      setItems(next);
      run(async () => {
         const saved = await adminFetch<Item[]>(`${endpoint}/reorder`, {
            method: 'POST',
            body: JSON.stringify({ ids: next.map((i) => i.id) }),
         });
         setItems(saved);
      });
   };

   const form = (
      <form className={styles.editor} onSubmit={save}>
         <div className={styles.grid}>
            {fields.map((def) => (
               <Field
                  key={`${editing}-${def.name}`}
                  def={def}
                  value={draft[def.name]}
                  onChange={(value) => setDraft((d) => ({ ...d, [def.name]: value }))}
               />
            ))}
         </div>
         <TranslationFields
            defs={fields}
            english={draft}
            translations={draft.translations as Translations | undefined}
            keyPrefix={String(editing)}
            onChange={(translations) => setDraft((d) => ({ ...d, translations }))}
         />
         <div className={styles.formFooter}>
            <button type="submit" className={styles.primary} disabled={busy}>
               {busy ? 'Saving…' : editing === 'new' ? 'Create' : 'Save'}
            </button>
            <button type="button" className={styles.button} onClick={() => setEditing(null)}>
               Cancel
            </button>
         </div>
      </form>
   );

   return (
      <div>
         <header className={styles.pageHeader}>
            <div>
               <h1>{title}</h1>
               <p>{description}</p>
            </div>
            <button
               type="button"
               className={styles.primary}
               onClick={() => startEdit(null)}
               disabled={editing === 'new'}>
               New
            </button>
         </header>

         {error && <p className={styles.errorBanner}>{error}</p>}
         {notice && <p className={styles.notice}>{notice}</p>}
         {editing === 'new' && form}

         {items === null ? (
            <p className={styles.muted}>Loading…</p>
         ) : items.length === 0 ? (
            <p className={styles.muted}>Nothing here yet.</p>
         ) : (
            <ol className={styles.rows}>
               {items.map((item, index) => {
                  const { title: rowTitle, meta } = summarize(item);
                  const open = editing === item.id;
                  return (
                     <li key={item.id} className={open ? styles.rowOpen : undefined}>
                        <div className={styles.row}>
                           <div className={styles.rowText}>
                              <strong>{rowTitle}</strong>
                              {meta && <span>{meta}</span>}
                           </div>
                           {item.visible === false && <span className={styles.badge}>Hidden</span>}
                           <div className={styles.rowActions}>
                              <button
                                 type="button"
                                 aria-label="Move up"
                                 disabled={busy || index === 0}
                                 onClick={() => move(index, -1)}>
                                 ↑
                              </button>
                              <button
                                 type="button"
                                 aria-label="Move down"
                                 disabled={busy || index === items.length - 1}
                                 onClick={() => move(index, 1)}>
                                 ↓
                              </button>
                              <button
                                 type="button"
                                 onClick={() => (open ? setEditing(null) : startEdit(item))}>
                                 {open ? 'Close' : 'Edit'}
                              </button>
                              <button
                                 type="button"
                                 className={styles.danger}
                                 disabled={busy}
                                 onClick={() => remove(item)}>
                                 Delete
                              </button>
                           </div>
                        </div>
                        {open && form}
                     </li>
                  );
               })}
            </ol>
         )}
      </div>
   );
}
