import Image from 'next/image';
import Link from 'next/link';
import avatar from '../../assets/berk_avatar.jpg';
import { Dictionary, Locale, LOCALE_PATHS, LOCALES } from '../../lib/i18n';
import LocalClock from './LocalClock';
import SectionNav from './SectionNav';
import SocialIcon from './SocialIcon';
import ThemeToggle from './ThemeToggle';
import TrackedLink from './TrackedLink';
import styles from './Header.module.css';

type HeaderProps = { name: string; lang: Locale; t: Dictionary; github?: string; linkedin?: string };

export default function Header({ name, lang, t, github, linkedin }: HeaderProps) {
   const handle = github?.split('/').filter(Boolean).pop() ?? 'berk';

   return (
      <header className={styles.bar}>
         <div className={styles.inner}>
            {/* Nameplate: who, and where and when underneath. */}
            <div className={styles.identity}>
               <a href="#top" className={styles.avatarLink} aria-hidden="true" tabIndex={-1}>
                  <Image src={avatar} alt="" width={32} height={32} className={styles.avatar} priority />
               </a>
               <a href="#top" className={`${styles.brand} blink`}>
                  {name}
               </a>
               <LocalClock
                  timeZone="Europe/Istanbul"
                  label={t.header.clock}
                  title={t.header.clockTitle}
                  className={styles.clock}
               />
            </div>
            <SectionNav labels={t.nav} className={styles.nav} optionalClassName={styles.optional} />
            <div className={styles.tools}>
               {/* Outward: my profiles, joined in one capsule. */}
               {(github || linkedin) && (
                  <div className={styles.profiles}>
                     {github && (
                        <TrackedLink
                           href={github}
                           className={styles.profile}
                           aria-label="GitHub"
                           title="GitHub"
                           log={{ command: `open github.com/${handle}`, output: t.hero.openedGithub }}>
                           <SocialIcon name="github" size={15} />
                        </TrackedLink>
                     )}
                     {linkedin && (
                        <TrackedLink
                           href={linkedin}
                           className={styles.profile}
                           aria-label="LinkedIn"
                           title="LinkedIn"
                           log={{ command: 'open linkedin', output: t.hero.openedLinkedin }}>
                           <SocialIcon name="linkedin" size={15} />
                        </TrackedLink>
                     )}
                  </div>
               )}
               {/* Inward: preferences for this page, language and theme together. */}
               <div className={styles.prefs}>
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
         </div>
         <span className={styles.progress} aria-hidden="true" />
      </header>
   );
}
