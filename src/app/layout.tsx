import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Newsreader } from 'next/font/google';

import { DEFAULT_THEME, THEME_COLORS, themeBootScript } from '../lib/theme';
import './globals.css';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin', 'latin-ext'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin', 'latin-ext'],
});

const newsreader = Newsreader({
   variable: '--font-newsreader',
   subsets: ['latin', 'latin-ext'],
   style: ['normal', 'italic'],
});

export const metadata: Metadata = {
   metadataBase: new URL('https://berklimoncu.com'),
   title: 'Berk Limoncu · Full-stack & mobile developer',
   description:
      'Berk Limoncu is a full-stack and mobile developer in Berlin, working with React, TypeScript, Node.js and Spring Boot.',
   openGraph: {
      title: 'Berk Limoncu',
      description: 'Full-stack & mobile developer in Berlin',
      url: 'https://berklimoncu.com',
      siteName: 'Berk Limoncu',
      images: [
         {
            url: '/images/og-image.png',
            width: 1200,
            height: 630,
         },
      ],
      locale: 'en_US',
      type: 'website',
   },
   icons: {
      icon: '/bico.ico',
      apple: '/bico.ico',
   },
};

export const viewport: Viewport = {
   // Dark by default; ThemeToggle and the boot script update it for light.
   themeColor: THEME_COLORS[DEFAULT_THEME],
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html
         lang="en"
         data-theme={DEFAULT_THEME}
         className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable}`}
         // The boot script may switch data-theme before React hydrates.
         suppressHydrationWarning>
         <head>
            <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
         </head>
         <body>{children}</body>
      </html>
   );
}
