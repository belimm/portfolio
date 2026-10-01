'use client';

// Must come before react-pdf: PDF.js uses these APIs as soon as it loads.
import './polyfills';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { Dictionary } from '../../lib/i18n';
import styles from './CvViewer.module.css';

// Must live in the same module that renders <Document>, see react-pdf's README.
// Our own worker entry, so the polyfills also run inside the worker (see pdf.worker.ts).
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerPort) {
   pdfjs.GlobalWorkerOptions.workerPort = new Worker(new URL('./pdf.worker.ts', import.meta.url));
}

const ZOOM_STEPS = [0.75, 1, 1.25, 1.5];
const MAX_PAGE_WIDTH = 820;

type CvViewerProps = {
   url: string;
   fileName: string;
   onClose: () => void;
   labels: Dictionary['cv'];
};

/**
 * PDF viewer with our own frame. react-pdf only renders pages (pdf.js under the hood),
 * so the folder tab, toolbar and page margins below are all ours to restyle.
 */
export default function CvViewer({ url, fileName, onClose, labels }: CvViewerProps) {
   const [numPages, setNumPages] = useState(0);
   const [currentPage, setCurrentPage] = useState(1);
   const [zoomIndex, setZoomIndex] = useState(1);
   const [available, setAvailable] = useState(MAX_PAGE_WIDTH);
   const [failed, setFailed] = useState(false);
   const deskRef = useRef<HTMLDivElement>(null);
   const closeRef = useRef<HTMLButtonElement>(null);
   const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

   // Lock page scroll, focus the dialog, close on Escape.
   useEffect(() => {
      const previous = document.body.style.overflow;
      const opener = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      closeRef.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', onKey);
      return () => {
         document.body.style.overflow = previous;
         window.removeEventListener('keydown', onKey);
         opener?.focus();
      };
   }, [onClose]);

   // Fit pages to the desk width.
   useEffect(() => {
      const desk = deskRef.current;
      if (!desk) return;
      const observer = new ResizeObserver(([entry]) => {
         setAvailable(Math.min(MAX_PAGE_WIDTH, entry.contentRect.width - 32));
      });
      observer.observe(desk);
      return () => observer.disconnect();
   }, []);

   // Track which page is in view for the counter.
   useEffect(() => {
      if (!numPages) return;
      const observer = new IntersectionObserver(
         (entries) => {
            const visible = entries.find((e) => e.isIntersecting);
            if (visible) setCurrentPage(Number((visible.target as HTMLElement).dataset.page));
         },
         { root: deskRef.current, threshold: 0.5 }
      );
      pageRefs.current.forEach((el) => el && observer.observe(el));
      return () => observer.disconnect();
   }, [numPages]);

   const zoom = ZOOM_STEPS[zoomIndex];
   const pageWidth = Math.round(available * zoom);

   const goTo = useCallback((page: number) => {
      pageRefs.current[page - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
   }, []);

   return (
      <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
         <div className={styles.folder} role="dialog" aria-modal="true" aria-label={`${fileName} ${labels.preview}`}>
            <div className={styles.tab}>
               <span className={styles.clip} aria-hidden="true" />
               {fileName}
            </div>

            <header className={styles.toolbar}>
               <div className={styles.group}>
                  <button
                     type="button"
                     onClick={() => goTo(currentPage - 1)}
                     disabled={currentPage <= 1}
                     aria-label={labels.previous}>
                     ↑
                  </button>
                  <span className={styles.counter}>
                     {numPages ? `${currentPage} / ${numPages}` : '– / –'}
                  </span>
                  <button
                     type="button"
                     onClick={() => goTo(currentPage + 1)}
                     disabled={currentPage >= numPages}
                     aria-label={labels.next}>
                     ↓
                  </button>
               </div>

               <div className={styles.group}>
                  <button
                     type="button"
                     onClick={() => setZoomIndex((z) => Math.max(0, z - 1))}
                     disabled={zoomIndex === 0}
                     aria-label={labels.zoomOut}>
                     −
                  </button>
                  <span className={styles.counter}>{Math.round(zoom * 100)}%</span>
                  <button
                     type="button"
                     onClick={() => setZoomIndex((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
                     disabled={zoomIndex === ZOOM_STEPS.length - 1}
                     aria-label={labels.zoomIn}>
                     +
                  </button>
               </div>

               <div className={`${styles.group} ${styles.end}`}>
                  <a href={url} download={fileName} className={styles.text}>
                     {labels.download}
                  </a>
                  <button ref={closeRef} type="button" onClick={onClose} className={styles.text}>
                     {labels.close} <kbd>esc</kbd>
                  </button>
               </div>
            </header>

            <div className={styles.desk} ref={deskRef}>
               {failed ? (
                  <p className={styles.message}>
                     {labels.failed} <a href={url}>{labels.openDirectly}</a>.
                  </p>
               ) : (
                  <Document
                     file={url}
                     onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                     onLoadError={(error) => {
                        console.error('CV viewer: the PDF failed to load', error);
                        setFailed(true);
                     }}
                     loading={
                        <p className={styles.message} role="status">
                           <span className="spinner" aria-hidden="true" /> {labels.loading}
                        </p>
                     }
                     className={styles.document}>
                     {Array.from({ length: numPages }, (_, i) => (
                        <div
                           key={i}
                           className={styles.sheet}
                           data-page={i + 1}
                           ref={(el) => {
                              pageRefs.current[i] = el;
                           }}>
                           <span className={styles.folio}>p. {i + 1}</span>
                           <Page
                              pageNumber={i + 1}
                              width={pageWidth}
                              onRenderError={(error) => console.error(`CV viewer: page ${i + 1} failed to render`, error)}
                              loading={<div style={{ width: pageWidth, aspectRatio: '1 / 1.414' }} />}
                           />
                        </div>
                     ))}
                  </Document>
               )}
            </div>
         </div>
      </div>
   );
}
