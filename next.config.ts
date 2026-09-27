import type { NextConfig } from 'next';

const securityHeaders = [
   { key: 'X-Content-Type-Options', value: 'nosniff' },
   { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
   { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
   { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
   // Self-contained server for the Docker image. Ignored by Vercel.
   output: 'standalone',
   webpack(config) {
      // PDF.js's default build calls very new APIs (Promise.try, Map#getOrInsertComputed,
      // Math.sumPrecise…) and throws in browsers that lack them, e.g. Safari before 18.2.
      // The legacy build ships polyfills, so react-pdf is pointed at it everywhere.
      config.resolve.alias = {
         ...config.resolve.alias,
         'pdfjs-dist$': 'pdfjs-dist/legacy/build/pdf.mjs',
         'pdfjs-dist/web/pdf_viewer.mjs': 'pdfjs-dist/legacy/web/pdf_viewer.mjs',
         'pdfjs-dist/build/pdf.worker.mjs': 'pdfjs-dist/legacy/build/pdf.worker.mjs',
      };
      return config;
   },
   async headers() {
      return [{ source: '/:path*', headers: securityHeaders }];
   },
};

export default nextConfig;
