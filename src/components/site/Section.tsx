import React from 'react';
import BinaryField from './BinaryField';
import SectionReveal from './SectionReveal';
import styles from './Section.module.css';

type SectionProps = {
   id: string;
   index: string;
   title: string;
   aside?: React.ReactNode;
   children: React.ReactNode;
};

/** Delay for the nth piece of a section's entrance (capped so long lists don't drag). */
export const stagger = (n: number, base = 0) => ({ '--d': `${base + Math.min(n, 6) * 70}ms` }) as React.CSSProperties;

export default function Section({ id, index, title, aside, children }: SectionProps) {
   return (
      <section id={id} className={styles.section} aria-labelledby={`${id}-title`} data-reveal>
         <SectionReveal id={id} />
         {/* Alternates with each section: 01 drifts down, 02 up, 03 down… (the hero drifts up). */}
         <BinaryField variant="section" direction={Number(index) % 2 === 1 ? 'down' : 'up'} />
         <div className={styles.inner}>
            <div className={styles.label}>
               <span className={`${styles.index} sr`}>{index}</span>
               {/* Same entrance as the hero headline: each word slides up out of its own line box. */}
               <h2 id={`${id}-title`} className={styles.title}>
                  {title.split(' ').map((word, i) => (
                     <React.Fragment key={i}>
                        {i > 0 && ' '}
                        <span className="sr-word">
                           <span style={{ '--i': i } as React.CSSProperties}>{word}</span>
                        </span>
                     </React.Fragment>
                  ))}
               </h2>
               {aside && (
                  <div className={`${styles.aside} sr`} style={stagger(0, 240)}>
                     {aside}
                  </div>
               )}
            </div>
            <div className={styles.body}>{children}</div>
         </div>
      </section>
   );
}
