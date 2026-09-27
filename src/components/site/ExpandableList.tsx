'use client';

import React, { useId, useRef, useState } from 'react';
import { useTerminal } from '../../contexts/TerminalContext';

type ExpandableListProps = {
   children: React.ReactNode;
   limit: number;
   labels: { more: string; less: string };
   log: { command: string; output: string };
   className?: string;
   buttonClassName?: string;
   revealedClassName?: string;
};

/**
 * Shows the first `limit` items and a toggle for the rest. Every item is still rendered
 * (the extras only get `hidden`), so the full list stays in the HTML for search engines.
 */
export default function ExpandableList({
   children,
   limit,
   labels,
   log,
   className,
   buttonClassName,
   revealedClassName,
}: ExpandableListProps) {
   const { addTerminalEntry } = useTerminal();
   const [open, setOpen] = useState(false);
   const buttonRef = useRef<HTMLButtonElement>(null);
   const listId = useId();
   const items = React.Children.toArray(children) as React.ReactElement<React.HTMLAttributes<HTMLElement>>[];
   const extra = items.length - limit;

   const toggle = () => {
      if (!open) addTerminalEntry(log);
      setOpen(!open);
      // After collapsing, keep the button where the reader is instead of leaving them far below.
      if (open) requestAnimationFrame(() => buttonRef.current?.scrollIntoView({ block: 'nearest' }));
   };

   return (
      <>
         <ul className={className} id={listId}>
            {items.map((item, i) =>
               i < limit
                  ? item
                  : React.cloneElement(item, {
                       hidden: !open,
                       className: [item.props.className, revealedClassName].filter(Boolean).join(' '),
                    })
            )}
         </ul>
         {extra > 0 && (
            <button
               ref={buttonRef}
               type="button"
               className={buttonClassName}
               aria-expanded={open}
               aria-controls={listId}
               onClick={toggle}>
               {open ? labels.less : labels.more}
               <span aria-hidden="true">{open ? ' ↑' : ' ↓'}</span>
            </button>
         )}
      </>
   );
}
