'use client';

import React from 'react';
import { TerminalEntry, useTerminal } from '../../contexts/TerminalContext';

type TrackedLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
   log: TerminalEntry;
};

/** An anchor that also writes a line to the terminal when clicked. */
export default function TrackedLink({ log, onClick, ...props }: TrackedLinkProps) {
   const { addTerminalEntry } = useTerminal();
   const external = props.href?.startsWith('http') || props.href?.endsWith('.pdf');

   return (
      <a
         {...props}
         target={external ? '_blank' : props.target}
         rel={external ? 'noopener noreferrer' : props.rel}
         onClick={(e) => {
            addTerminalEntry(log);
            onClick?.(e);
         }}
      />
   );
}
