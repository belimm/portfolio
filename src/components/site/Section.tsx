import React from 'react';
import styles from './Section.module.css';

type SectionProps = {
   id: string;
   index: string;
   title: string;
   aside?: React.ReactNode;
   children: React.ReactNode;
};

export default function Section({ id, index, title, aside, children }: SectionProps) {
   return (
      <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
         <div className={styles.label}>
            <span className={styles.index}>{index}</span>
            <h2 id={`${id}-title`} className={styles.title}>
               {title}
            </h2>
            {aside && <div className={styles.aside}>{aside}</div>}
         </div>
         <div className={styles.body}>{children}</div>
      </section>
   );
}
