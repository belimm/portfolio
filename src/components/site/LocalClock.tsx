'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.css';

type LocalClockProps = { timeZone: string; label: string; title: string; className?: string };

/**
 * Current time in my city; rendered after mount so server and client HTML match.
 * On hover or focus the line rolls up to reveal the UTC offset (GMT+3).
 */
export default function LocalClock({ timeZone, label, title, className }: LocalClockProps) {
   const [now, setNow] = useState<{ time: string; offset: string } | null>(null);

   useEffect(() => {
      const format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' });
      const zone = new Intl.DateTimeFormat('en-GB', { timeZone, timeZoneName: 'shortOffset' });
      const tick = () => {
         const date = new Date();
         const offset = zone.formatToParts(date).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
         setNow({ time: format.format(date), offset });
      };
      tick();
      const id = setInterval(tick, 15_000);
      return () => clearInterval(id);
   }, [timeZone]);

   const offset = now?.offset ?? 'GMT';

   return (
      // Focusable so keyboard and touch users can reach the offset too.
      <span className={className} tabIndex={0} aria-label={`${title}: ${now?.time ?? ''} ${offset}`.trim()}>
         <span className={styles.clockRoll} aria-hidden="true">
            <span className={styles.clockFace}>
               {label} <time>{now?.time ?? '--:--'}</time>
            </span>
            <span className={styles.clockFace}>{offset}</span>
         </span>
      </span>
   );
}
