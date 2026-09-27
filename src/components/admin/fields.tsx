'use client';

/* eslint-disable @next/next/no-img-element -- previews of arbitrary uploaded URLs */
import React, { useState } from 'react';
import { uploadFile } from './api';
import styles from './admin.module.css';

export type FieldDef = {
   name: string;
   label: string;
   type: 'text' | 'textarea' | 'lines' | 'tags' | 'checkbox' | 'select' | 'file';
   hint?: string;
   options?: { value: string; label: string }[];
   accept?: string;
   wide?: boolean;
   required?: boolean;
   /** Also shown in the Turkish section; stored under translations.tr. */
   translatable?: boolean;
};

export type Translations = Record<string, Record<string, unknown>>;

type FieldProps = {
   def: FieldDef;
   value: unknown;
   onChange: (value: unknown) => void;
   idPrefix?: string;
   placeholder?: string;
};

export function Field({ def, value, onChange, idPrefix = 'field', placeholder }: FieldProps) {
   const id = `${idPrefix}-${def.name}`;
   const label = (
      <label htmlFor={id} className={styles.label}>
         {def.label}
         {def.hint && <span className={styles.hint}>{def.hint}</span>}
      </label>
   );

   switch (def.type) {
      case 'checkbox':
         return (
            <label className={`${styles.field} ${styles.check}`}>
               <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => onChange(e.target.checked)}
               />
               <span>{def.label}</span>
            </label>
         );
      case 'textarea':
         return (
            <div className={`${styles.field} ${styles.wide}`}>
               {label}
               <textarea
                  id={id}
                  rows={4}
                  value={String(value ?? '')}
                  required={def.required}
                  placeholder={placeholder}
                  onChange={(e) => onChange(e.target.value)}
               />
            </div>
         );
      case 'select':
         return (
            <div className={styles.field}>
               {label}
               <select id={id} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
                  {def.options?.map((o) => (
                     <option key={o.value} value={o.value}>
                        {o.label}
                     </option>
                  ))}
               </select>
            </div>
         );
      case 'lines':
      case 'tags':
         return (
            <ListField
               def={def}
               id={id}
               label={label}
               value={value as string[]}
               onChange={onChange}
               placeholder={placeholder}
            />
         );
      case 'file':
         return <FileField def={def} id={id} label={label} value={String(value ?? '')} onChange={onChange} />;
      default:
         return (
            <div className={`${styles.field} ${def.wide ? styles.wide : ''}`}>
               {label}
               <input
                  id={id}
                  value={String(value ?? '')}
                  required={def.required}
                  placeholder={placeholder}
                  onChange={(e) => onChange(e.target.value)}
               />
            </div>
         );
   }
}

/**
 * The Turkish versions of the translatable fields. Empty fields fall back to English on the
 * site, so the English text is shown as the placeholder.
 */
export function TranslationFields({
   defs,
   english,
   translations,
   onChange,
   keyPrefix,
}: {
   defs: FieldDef[];
   english: Record<string, unknown>;
   translations: Translations | undefined;
   onChange: (next: Translations) => void;
   keyPrefix: string;
}) {
   const translatable = defs.filter((d) => d.translatable);
   if (translatable.length === 0) return null;
   const tr = translations?.tr ?? {};
   const asText = (v: unknown) => (Array.isArray(v) ? v.join(', ') : String(v ?? ''));

   return (
      <fieldset className={styles.translation}>
         <legend>
            Türkçe <span className={styles.hint}>Empty fields show the English text on /tr</span>
         </legend>
         <div className={styles.grid}>
            {translatable.map((def) => (
               <Field
                  key={`${keyPrefix}-tr-${def.name}`}
                  def={{ ...def, required: false, hint: undefined }}
                  idPrefix={`${keyPrefix}-tr`}
                  value={tr[def.name] ?? (def.type === 'lines' || def.type === 'tags' ? [] : '')}
                  placeholder={asText(english[def.name])}
                  onChange={(value) => onChange({ ...translations, tr: { ...tr, [def.name]: value } })}
               />
            ))}
         </div>
      </fieldset>
   );
}

/** string[] edited as comma-separated text (tags) or one item per line (lines). */
function ListField({
   def,
   id,
   label,
   value,
   onChange,
   placeholder,
}: {
   def: FieldDef;
   id: string;
   label: React.ReactNode;
   value: string[];
   onChange: (v: string[]) => void;
   placeholder?: string;
}) {
   const separator = def.type === 'tags' ? ', ' : '\n';
   const [draft, setDraft] = useState((value ?? []).join(separator));
   const parse = (text: string) =>
      text
         .split(def.type === 'tags' ? ',' : '\n')
         .map((s) => s.trim())
         .filter(Boolean);

   return (
      <div className={`${styles.field} ${styles.wide}`}>
         {label}
         {def.type === 'tags' ? (
            <input
               id={id}
               value={draft}
               placeholder={placeholder}
               onChange={(e) => {
                  setDraft(e.target.value);
                  onChange(parse(e.target.value));
               }}
            />
         ) : (
            <textarea
               id={id}
               rows={4}
               value={draft}
               placeholder={placeholder}
               onChange={(e) => {
                  setDraft(e.target.value);
                  onChange(parse(e.target.value));
               }}
            />
         )}
      </div>
   );
}

function FileField({
   def,
   id,
   label,
   value,
   onChange,
}: {
   def: FieldDef;
   id: string;
   label: React.ReactNode;
   value: string;
   onChange: (v: string) => void;
}) {
   const [busy, setBusy] = useState(false);
   const [error, setError] = useState('');
   const isImage = /\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(value);

   return (
      <div className={`${styles.field} ${styles.wide}`}>
         {label}
         <div className={styles.fileRow}>
            {isImage && <img src={value} alt="" className={styles.preview} />}
            <input id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="/images/… or https://…" />
            <label className={styles.button}>
               {busy ? 'Uploading…' : 'Upload'}
               <input
                  type="file"
                  accept={def.accept ?? 'image/*'}
                  hidden
                  disabled={busy}
                  onChange={async (e) => {
                     const file = e.target.files?.[0];
                     e.target.value = '';
                     if (!file) return;
                     setBusy(true);
                     setError('');
                     try {
                        onChange((await uploadFile(file, 'images')).url);
                     } catch (err) {
                        setError((err as Error).message);
                     } finally {
                        setBusy(false);
                     }
                  }}
               />
            </label>
         </div>
         {error && <p className={styles.error}>{error}</p>}
      </div>
   );
}
