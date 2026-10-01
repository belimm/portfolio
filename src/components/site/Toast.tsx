'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

export type ToastData = { id: number; kind: 'success' | 'error'; title: string; text: string };

type ToastProps = { toast: ToastData | null; onClose: () => void; closeLabel: string };

const VISIBLE_MS = { success: 5000, error: 9000 };
const LEAVE_MS = 200;

/**
 * A small notice in the corner. Rendered in a portal because the sections animate with
 * transforms, which would otherwise trap `position: fixed`. Hovering pauses the timer.
 */
export default function Toast({ toast, onClose, closeLabel }: ToastProps) {
   const [mounted, setMounted] = useState(false);
   const [leaving, setLeaving] = useState(false);
   const [paused, setPaused] = useState(false);
   const closeRef = useRef(onClose);
   closeRef.current = onClose;

   useEffect(() => setMounted(true), []);

   // New toast: show it again from the start.
   useEffect(() => {
      setLeaving(false);
      setPaused(false);
   }, [toast?.id]);

   const dismiss = () => {
      setLeaving(true);
      setTimeout(() => closeRef.current(), LEAVE_MS);
   };

   useEffect(() => {
      if (!toast || paused || leaving) return;
      const timer = setTimeout(dismiss, VISIBLE_MS[toast.kind]);
      return () => clearTimeout(timer);
   }, [toast, paused, leaving]);

   if (!mounted || !toast) return null;

   return createPortal(
      <div
         key={toast.id}
         className={`${styles.toast} ${styles[toast.kind]} ${leaving ? styles.leaving : ''}`}
         role={toast.kind === 'error' ? 'alert' : 'status'}
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}>
         <span className={styles.icon} aria-hidden="true">
            {toast.kind === 'success' ? '✓' : '!'}
         </span>
         <div className={styles.body}>
            <p className={styles.title}>{toast.title}</p>
            <p className={styles.text}>{toast.text}</p>
         </div>
         <button type="button" className={styles.close} onClick={dismiss} aria-label={closeLabel}>
            ×
         </button>
      </div>,
      document.body
   );
}
