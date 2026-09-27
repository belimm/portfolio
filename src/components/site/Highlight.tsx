import React from 'react';

/**
 * Renders text where ==this== becomes a highlighter mark. Editable from the admin panel.
 * With `reveal`, every word slides up into place on first paint (CSS only, see globals.css).
 */
export default function Highlight({ text, reveal = false }: { text: string; reveal?: boolean }) {
   const parts = text.split(/==(.+?)==/g);
   let wordIndex = 0;

   const words = (chunk: string) =>
      chunk.split(/(\s+)/).map((token, i) => {
         if (!token) return null;
         if (/^\s+$/.test(token)) return <React.Fragment key={i}> </React.Fragment>;
         const index = wordIndex++;
         return (
            <span key={i} className="reveal-word">
               <span style={{ '--i': index } as React.CSSProperties}>{token}</span>
            </span>
         );
      });

   const render = (chunk: string) => (reveal ? words(chunk) : chunk);

   return (
      <>
         {parts.map((part, i) =>
            i % 2 === 1 ? (
               <mark
                  key={i}
                  className={reveal ? 'mark mark-draw' : 'mark'}
                  style={reveal ? ({ '--i': wordIndex } as React.CSSProperties) : undefined}>
                  {render(part)}
               </mark>
            ) : (
               <React.Fragment key={i}>{render(part)}</React.Fragment>
            )
         )}
      </>
   );
}
