import type { GithubActivity } from '../../lib/github';
import { summarize } from '../../lib/github';
import { Dictionary, Locale } from '../../lib/i18n';
import styles from './Hero.module.css';

type Props = {
   activity: Promise<GithubActivity | null>;
   months: number;
   lang: Locale;
   t: Dictionary;
   style?: React.CSSProperties;
};

/** Placeholder line while the numbers load. */
export function GithubPulseSkeleton({ style }: { style?: React.CSSProperties }) {
   return <span className={`${styles.pulseSkeleton} skeleton fade-up`} style={style} aria-hidden="true" />;
}

/** One line under the hero links: recent contributions, linking down to the GitHub section. Nothing when there's no data. */
export default async function GithubPulse({ activity, months, lang, t, style }: Props) {
   const data = await activity;
   if (!data || data.days.length === 0) return null;

   const count = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB').format(summarize(data.days, months).total);
   return (
      <a href="#github" className={`${styles.pulse} fade-up`} style={style}>
         <span className={styles.pulseText}>{t.hero.pulse(count, months)}</span>
         <span className={styles.arrow} aria-hidden="true">
            ↓
         </span>
      </a>
   );
}
