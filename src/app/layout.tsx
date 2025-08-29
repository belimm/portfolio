import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import './globals.css';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});

const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

export const metadata: Metadata = {
   title: 'Berk Limoncu',
   description: 'Personal Portfolio',
   openGraph: {
      title: 'Berk Limoncu',
      description: 'Personal Portfolio',
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
      apple: '/bico.ico'
   },
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
            <Toaster position="top-right" />
         </body>
      </html>
   );
}
