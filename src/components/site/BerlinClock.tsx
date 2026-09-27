'use client';

import { useEffect, useState } from 'react';

const format = new Intl.DateTimeFormat('en-GB', {
   timeZone: 'Europe/Berlin',
   hour: '2-digit',
   minute: '2-digit',
});

type BerlinClockProps = { label: string; title: string; className?: string };

export default function BerlinClock({ label, title, className }: BerlinClockProps) {
   const [time, setTime] = useState<string | null>(null);

   useEffect(() => {
      const tick = () => setTime(format.format(new Date()));
      tick();
      const id = setInterval(tick, 15_000);
      return () => clearInterval(id);
   }, []);

   return (
      <span className={className} title={title}>
         {label} <time>{time ?? '--:--'}</time>
      </span>
   );
}
