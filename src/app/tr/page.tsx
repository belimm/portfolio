import type { Metadata } from 'next';
import HomePage from '../../components/site/HomePage';
import { getDictionary } from '../../lib/i18n';

export const revalidate = 60;

const t = getDictionary('tr');

export const metadata: Metadata = {
   title: t.meta.title,
   description: t.meta.description,
   alternates: { canonical: '/tr', languages: { en: '/', tr: '/tr' } },
   openGraph: { locale: 'tr_TR', title: 'Berk Limoncu', description: t.meta.description },
};

export default function HomeTr() {
   return <HomePage lang="tr" />;
}
