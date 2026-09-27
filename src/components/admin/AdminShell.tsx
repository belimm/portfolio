'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ThemeToggle from '../site/ThemeToggle';
import { adminFetch, inboxSeenAt } from './api';
import styles from './admin.module.css';

const NAV = [
   { href: '/admin/profile', label: 'Profile' },
   { href: '/admin/projects', label: 'Projects' },
   { href: '/admin/experience', label: 'Experience' },
   { href: '/admin/skills', label: 'Skills' },
   { href: '/admin/cv', label: 'CV' },
   { href: '/admin/messages', label: 'Messages' },
   { href: '/admin/history', label: 'History' },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();
   const [unread, setUnread] = useState(0);

   useEffect(() => {
      const load = () =>
         adminFetch<{ createdAt: string }[]>('messages')
            .then((list) => {
               const seen = inboxSeenAt();
               setUnread(list.filter((m) => m.createdAt > seen).length);
            })
            .catch(() => {});
      load();
      window.addEventListener('admin:messages', load);
      return () => window.removeEventListener('admin:messages', load);
   }, []);

   const signOut = async () => {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.assign('/admin/login');
   };

   return (
      <div className={styles.shell}>
         <aside className={styles.sidebar}>
            <p className={styles.brand}>Portfolio admin</p>
            <nav className={styles.nav}>
               {NAV.map((item) => (
                  <Link
                     key={item.href}
                     href={item.href}
                     aria-current={pathname === item.href ? 'page' : undefined}>
                     {item.label}
                     {item.href === '/admin/messages' && unread > 0 && (
                        <span className={styles.count}>{unread}</span>
                     )}
                  </Link>
               ))}
            </nav>
            <div className={styles.sidebarFooter}>
               <a href="/" target="_blank" rel="noopener noreferrer">
                  View site ↗
               </a>
               <button type="button" onClick={signOut}>
                  Sign out
               </button>
               <ThemeToggle labels={{ toDark: 'Switch to dark theme', toLight: 'Switch to light theme' }} />
            </div>
         </aside>
         <main className={styles.content}>{children}</main>
      </div>
   );
}
