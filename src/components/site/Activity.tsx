import type { GithubActivity } from '../../lib/github';
import { Dictionary, Locale } from '../../lib/i18n';
import ActivityPanel, { type Range } from './ActivityPanel';
import Section from './Section';
import styles from './Activity.module.css';

/** The section's frame while the data loads, laid out like the real panel so nothing jumps when it arrives. */
export function ActivitySkeleton({ t }: { t: Dictionary }) {
   return (
      <Section id="github" index="04" title={t.activity.title}>
         <div className={styles.panel} role="status" aria-label={t.activity.loading}>
            <div className={styles.toolbar} aria-hidden="true">
               <span className={`${styles.skelPill} skeleton`} />
               <span className={`${styles.skelPill} skeleton`} />
            </div>
            <div className={styles.stats} aria-hidden="true">
               {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                     <span className={`${styles.skelLabel} skeleton`} />
                     <span className={`${styles.skelValue} skeleton`} />
                  </div>
               ))}
            </div>
            <span className={`${styles.skelCalendar} skeleton`} aria-hidden="true" />
            <span className={`${styles.skelBars} skeleton`} aria-hidden="true" />
         </div>
      </Section>
   );
}

/** GitHub section: contribution calendar and monthly totals. Left out entirely when there's no data. */
export default async function Activity({
   activity,
   lang,
   t,
   months,
}: {
   activity: Promise<GithubActivity | null>;
   lang: Locale;
   t: Dictionary;
   /** Range shown first; the same window as the hero summary and the header card. */
   months: Range;
}) {
   const data = await activity;
   if (!data || data.days.length === 0) return null;
   return (
      <Section id="github" index="04" title={t.activity.title}>
         <ActivityPanel days={data.days} login={data.login} locale={lang} labels={t.activity} initialRange={months} />
      </Section>
   );
}
