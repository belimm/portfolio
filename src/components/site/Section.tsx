import React from 'react';
import BinaryField from './BinaryField';
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
         {/* Alternates with each section: 01 drifts down, 02 up, 03 down… (the hero drifts up). */}
         <BinaryField variant="section" direction={Number(index) % 2 === 1 ? 'down' : 'up'} />
         <div className={styles.inner}>
            <div className={styles.label}>
               <span className={styles.index}>{index}</span>
               <h2 id={`${id}-title`} className={styles.title}>
                  {title}
               </h2>
               {aside && <div className={styles.aside}>{aside}</div>}
            </div>
            <div className={styles.body}>{children}</div>
         </div>
      </section>
   );
}
