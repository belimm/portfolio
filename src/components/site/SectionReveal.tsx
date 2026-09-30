'use client';

import { useEffect } from 'react';

/**
 * Opens a section (sets data-in) when it scrolls into view and closes it again when the reader scrolls back
 * up until it is below the fold, so the entrance plays in reverse. Leaving through the top keeps it open.
 * The animation itself is CSS, see "Section reveals" in globals.css.
 */
export default function SectionReveal({ id }: { id: string }) {
   useEffect(() => {
      const section = document.getElementById(id);
      if (!section) return;

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) section.setAttribute('data-in', '');
            else if (entry.boundingClientRect.top > 0) section.removeAttribute('data-in');
         },
         // Open a little after the top edge appears, so the reader sees it happen.
         { rootMargin: '0px 0px -15% 0px' }
      );
      observer.observe(section);
      return () => observer.disconnect();
   }, [id]);

   return null;
}
