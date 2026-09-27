'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTerminal } from '../../contexts/TerminalContext';
import ViewerBoundary from '../CvViewer/ViewerBoundary';
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
         {open &&
            createPortal(
               <ViewerBoundary fallback={<ViewerFallback url={url} labels={labels} onClose={close} />}>
                  <CvViewer url={url} fileName={fileName} onClose={close} labels={labels} />
               </ViewerBoundary>,
               document.body
            )}
      </>
   );
}

/** Shown if the viewer can't run in this browser: the PDF itself always can. */
function ViewerFallback({ url, labels, onClose }: { url: string; labels: Dictionary['cv']; onClose: () => void }) {
   return (
      <div
         role="dialog"
         aria-modal="true"
         onClick={onClose}
         style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'grid',
            placeItems: 'center',
            padding: 24,
            background: 'rgba(20, 19, 17, 0.62)',
         }}>
         <p
            onClick={(e) => e.stopPropagation()}
            style={{
               padding: '20px 24px',
               borderRadius: 6,
               background: 'var(--paper-raised)',
               color: 'var(--ink)',
               fontSize: 15,
            }}>
            {labels.failed}{' '}
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
               {labels.openDirectly}
            </a>
         </p>
      </div>
   );
}
