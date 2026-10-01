import type { GithubActivity } from '../../lib/github';
import { summarize } from '../../lib/github';
import { Dictionary, Locale } from '../../lib/i18n';
import styles from './GithubPeek.module.css';

type Props = {
   activity: Promise<GithubActivity | null>;
   months: number;
   lang: Locale;
   labels: Dictionary['activity'];
};

/** The card's frame, shared by the loaded card and its placeholder. Hidden from screen readers: the GitHub section has the detail. */
function Shell({ children }: { children: React.ReactNode }) {
   return (
      <div className={styles.peek} data-peek aria-hidden="true">
         <div className={styles.card}>{children}</div>
      </div>
   );
}

/** Placeholder while the stats load, so the first hover isn't an empty card. */
export function GithubPeekSkeleton() {
   return (
      <Shell>
         <span className={`${styles.skelHead} skeleton`} />
         <div className={styles.stats}>
            {[0, 1, 2, 3].map((i) => (
               <span key={i} className={`${styles.skelStat} skeleton`} />
            ))}
         </div>
         <span className={`${styles.skelSpark} skeleton`} />
      </Shell>
   );
}

/**
 * Small card under the header's GitHub icon: the headline numbers and a weekly sparkline.
 * Shown on hover or keyboard focus (CSS, see `.profileWrap` in Header.module.css) and only where hover exists.
 * Renders nothing when GitHub has no data.
 */
export default async function GithubPeek({ activity, months, lang, labels }: Props) {
   const data = await activity;
   if (!data || data.days.length === 0) return null;

   const summary = summarize(data.days, months);
   const intl = lang === 'tr' ? 'tr-TR' : 'en-GB';
   const number = new Intl.NumberFormat(intl);
   const day = new Intl.DateTimeFormat(intl, { day: 'numeric', month: 'short', timeZone: 'UTC' });
   const peak = Math.max(1, ...summary.weekly);

   const stats = [
      { label: labels.contributions, value: number.format(summary.total) },
      { label: labels.activeDays, value: number.format(summary.active) },
      { label: labels.longestStreak, value: labels.days.replace('{n}', number.format(summary.longest)) },
      {
         label: labels.busiestDay,
         value: number.format(summary.busiest.count),
         sub: day.format(new Date(`${summary.busiest.date}T00:00:00Z`)),
      },
   ];

   return (
      <Shell>
         <p className={styles.head}>
            <span>github.com/{data.login}</span>
            <span>{labels.ranges.replace('{n}', String(months))}</span>
         </p>
         <dl className={styles.stats}>
            {stats.map((s) => (
               <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>
                     {s.value}
                     {s.sub && <span>{s.sub}</span>}
                  </dd>
               </div>
            ))}
         </dl>
         <div className={styles.spark}>
            {summary.weekly.map((n, i) => (
               <i key={i} style={{ height: n === 0 ? 2 : `${Math.max(8, (n / peak) * 100)}%` }} data-empty={n === 0 || undefined} />
            ))}
         </div>
      </Shell>
   );
}
