import { DATE_LOCALES, Dictionary, Locale } from '../../lib/i18n';
import styles from './Footer.module.css';

type FooterProps = { name: string; updatedAt: string | null; lang: Locale; t: Dictionary };

export default function Footer({ name, updatedAt, lang, t }: FooterProps) {
   const date = new Intl.DateTimeFormat(DATE_LOCALES[lang], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
   });
   return (
      <footer className={styles.footer}>
         <p>
            © {new Date().getFullYear()} {name}
         </p>
         {updatedAt && (
            <p>
               {t.footer.updated} {date.format(new Date(updatedAt))}
            </p>
         )}
      </footer>
   );
}
