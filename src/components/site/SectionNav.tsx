'use client';

import { useEffect, useState } from 'react';

const SECTIONS = [
   { id: 'work', optional: true },
   { id: 'experience', optional: true },
   { id: 'skills', optional: true },
   { id: 'contact', optional: false },
] as const;

type Labels = Record<(typeof SECTIONS)[number]['id'] | 'sections', string>;

/** Header links that mark the section currently being read. */
export default function SectionNav({
   labels,
   className,
   optionalClassName,
}: {
   labels: Labels;
   className?: string;
   optionalClassName?: string;
}) {
   const [active, setActive] = useState<string | null>(null);

   useEffect(() => {
      const targets = SECTIONS.map((s) => document.getElementById(s.id)).filter(
         (el): el is HTMLElement => el !== null
      );
      // A thin band a third of the way down the viewport decides which section is "current".
      const observer = new IntersectionObserver(
         (entries) => {
            for (const entry of entries) {
               if (entry.isIntersecting) setActive(entry.target.id);
            }
         },
         { rootMargin: '-33% 0px -66% 0px' }
      );
      targets.forEach((el) => observer.observe(el));

      const onScroll = () => window.scrollY < 200 && setActive(null);
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => {
         observer.disconnect();
         window.removeEventListener('scroll', onScroll);
      };
   }, []);

   return (
      <nav className={className} aria-label={labels.sections}>
         {SECTIONS.map((s) => (
            <a
               key={s.id}
               href={`#${s.id}`}
               className={s.optional ? optionalClassName : undefined}
               aria-current={active === s.id ? 'location' : undefined}>
               {labels[s.id]}
            </a>
         ))}
      </nav>
   );
}
