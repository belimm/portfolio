import type { GithubActivity } from '../../lib/github';
import { Dictionary, Locale } from '../../lib/i18n';
import ActivityPanel, { type Range } from './ActivityPanel';
import Section from './Section';

/** GitHub section: contribution calendar and monthly totals. Left out entirely when there's no data. */
export default function Activity({
   activity,
   lang,
   t,
   months,
}: {
   activity: GithubActivity | null;
   lang: Locale;
   t: Dictionary;
   /** Range shown first; the same window as the hero summary and the header card. */
   months: Range;
}) {
   if (!activity || activity.days.length === 0) return null;
   return (
      <Section id="github" index="04" title={t.activity.title}>
         <ActivityPanel days={activity.days} login={activity.login} locale={lang} labels={t.activity} initialRange={months} />
      </Section>
   );
}
