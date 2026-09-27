'use client';

import { useEffect, useState } from 'react';

type LocalClockProps = { timeZone: string; label: string; title: string; className?: string };

/** Current time in my city; rendered after mount so server and client HTML match. */
export default function LocalClock({ timeZone, label, title, className }: LocalClockProps) {
   const [time, setTime] = useState<string | null>(null);

   useEffect(() => {
      const format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit' });
      const tick = () => setTime(format.format(new Date()));
      tick();
      const id = setInterval(tick, 15_000);
      return () => clearInterval(id);
   }, [timeZone]);

   return (
      <span className={className} title={title}>
         {label} <time>{time ?? '--:--'}</time>
      </span>
   );
}
