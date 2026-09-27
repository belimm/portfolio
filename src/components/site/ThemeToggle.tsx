'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_THEME, THEME_COLORS, THEME_STORAGE_KEY, Theme } from '../../lib/theme';
import styles from './Header.module.css';

export default function ThemeToggle({ labels }: { labels: { toDark: string; toLight: string } }) {
   const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

   useEffect(() => {
      setTheme((document.documentElement.dataset.theme as Theme) || DEFAULT_THEME);
   }, []);

   const toggle = () => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[next]);
      try {
         localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
         // Private mode or blocked storage: the choice just won't be remembered.
      }
      setTheme(next);
   };

   const label = theme === 'dark' ? labels.toLight : labels.toDark;

   return (
      <button type="button" className={styles.iconButton} onClick={toggle} aria-label={label} title={label}>
         {theme === 'dark' ? (
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
               <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
               <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M10 1.8v2M10 16.2v2M1.8 10h2M16.2 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" />
               </g>
            </svg>
         ) : (
            <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
               <path
                  d="M16.5 12.3A7 7 0 0 1 7.7 3.5a7 7 0 1 0 8.8 8.8Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
               />
            </svg>
         )}
      </button>
   );
}
