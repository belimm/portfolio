'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTerminal } from '../../contexts/TerminalContext';
import type { Dictionary } from '../../lib/i18n';

// pdf.js only runs in the browser; load it when someone actually opens the CV.
const CvViewer = dynamic(() => import('../CvViewer/CvViewer'), { ssr: false });

type CvButtonProps = {
   url: string;
   className?: string;
   label: string;
   logOutput: string;
   labels: Dictionary['cv'];
};

export default function CvButton({ url, className, label, logOutput, labels }: CvButtonProps) {
   const { addTerminalEntry } = useTerminal();
   const [open, setOpen] = useState(false);
   const close = useCallback(() => setOpen(false), []);
   const fileName = decodeURIComponent(url.split('/').pop() || 'cv.pdf');

   return (
      <>
         <button
            type="button"
            className={className}
            onClick={() => {
               setOpen(true);
               addTerminalEntry({ command: `less ${fileName}`, output: logOutput });
            }}>
            {label}
         </button>
         {/* Portal: animated ancestors use transforms, which would trap position: fixed. */}
         {open && createPortal(<CvViewer url={url} fileName={fileName} onClose={close} labels={labels} />, document.body)}
      </>
   );
}
