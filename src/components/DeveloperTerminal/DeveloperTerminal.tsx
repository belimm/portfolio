'use client';

import React, { useEffect, useRef } from 'react';
import { useTerminal } from '../../contexts/TerminalContext';
import styles from './DeveloperTerminal.module.css';

/** A small shell that echoes what the visitor does on the page. */
export default function DeveloperTerminal({ title, label }: { title: string; label: string }) {
   const { terminalEntries } = useTerminal();
   const scrollRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
   }, [terminalEntries]);

   return (
      <figure className={styles.window} aria-label={label}>
         <figcaption className={styles.titleBar}>
            <span className={styles.dots} aria-hidden="true">
               <i />
               <i />
               <i />
            </span>
            <span className={styles.title}>{title}</span>
         </figcaption>
         <div className={styles.scroll} ref={scrollRef} aria-live="polite">
            {terminalEntries.map((entry, idx) => (
               <div key={idx} className={styles.entry}>
                  <div>
                     <span className={styles.prompt}>~ $</span>
                     {entry.command}
                  </div>
                  {entry.output && (
                     <div className={styles.output}>{entry.output}</div>
                  )}
               </div>
            ))}
            <div className={styles.entry}>
               <span className={styles.prompt}>~ $</span>
               <span className={styles.cursor} />
            </div>
         </div>
      </figure>
   );
}
