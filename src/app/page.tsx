import type { Metadata } from 'next';
import HomePage from '../components/site/HomePage';
import { getDictionary } from '../lib/i18n';

// Rebuilt at most once a minute; saving in /admin revalidates it immediately.
export const revalidate = 60;

const t = getDictionary('en');

export const metadata: Metadata = {
   title: t.meta.title,
   description: t.meta.description,
   alternates: { canonical: '/', languages: { en: '/', tr: '/tr' } },
};

export default function Home() {
   return <HomePage lang="en" />;
}
