'use client';

import { useEffect, useState } from 'react';
import styles from './SectionNav.module.css';

const sections = ['title', 'projects', 'skills', 'contact'];

export default function SectionNav() {
   const [activeSection, setActiveSection] = useState<string | null>(null);

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  setActiveSection(entry.target.id);
               }
            });
         },
         {
            rootMargin: '-40% 0px -55% 0px',
            threshold: 0.01,
         }
      );

      sections.forEach((id) => {
         const el = document.getElementById(id);
         if (el) observer.observe(el);
      });

      return () => {
         sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.unobserve(el);
         });
      };
   }, []);

   return (
      <div className={styles.navContainer}>
         {sections.map((section) => (
            <a
               key={section}
               href={`#${section}`}
               className={`${styles.navLink} ${
                  activeSection === section ? styles.navLinkActive : ''
               }`}>
               {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
         ))}
      </div>
   );
}
