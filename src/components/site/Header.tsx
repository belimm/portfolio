import Image from 'next/image';
import Link from 'next/link';
import avatar from '../../assets/berk_avatar.jpg';
import { Dictionary, Locale, LOCALE_PATHS, LOCALES } from '../../lib/i18n';
import BerlinClock from './BerlinClock';
import SectionNav from './SectionNav';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

type HeaderProps = { name: string; lang: Locale; t: Dictionary };

export default function Header({ name, lang, t }: HeaderProps) {
   return (
      <header className={styles.bar}>
         <div className={styles.inner}>
            <a href="#top" className={styles.brand}>
               <Image
                  src={avatar}
                  alt=""
                  width={30}
                  height={30}
                  className={styles.avatar}
                  priority
               />
               <span>{name}</span>
            </a>
            <SectionNav labels={t.nav} className={styles.nav} optionalClassName={styles.optional} />
            <div className={styles.tools}>
               <BerlinClock label={t.header.clock} title={t.header.clockTitle} className={styles.clock} />
               <nav className={styles.languages} aria-label={t.header.language}>
                  {LOCALES.map((locale) => (
                     <Link
                        key={locale}
                        href={LOCALE_PATHS[locale]}
                        hrefLang={locale}
                        lang={locale}
                        aria-current={locale === lang ? 'true' : undefined}>
                        {locale.toUpperCase()}
                     </Link>
                  ))}
               </nav>
               <ThemeToggle labels={{ toDark: t.header.toDark, toLight: t.header.toLight }} />
            </div>
         </div>
      </header>
   );
}
