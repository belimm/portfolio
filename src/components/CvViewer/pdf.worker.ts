/**
 * Our PDF.js worker: installs the polyfills in the worker's own global scope first, then
 * runs PDF.js's legacy worker, which connects itself to this worker's message port.
 */
import './polyfills';
import 'pdfjs-dist/legacy/build/pdf.worker.min.mjs';
