import type { GithubActivity } from '../../lib/github';
import { Dictionary, Locale } from '../../lib/i18n';
import ActivityPanel from './ActivityPanel';
import Section from './Section';

/** GitHub contribution calendar and monthly totals. Left out entirely when there's no data. */
export default function Activity({ activity, lang, t }: { activity: GithubActivity | null; lang: Locale; t: Dictionary }) {
   if (!activity || activity.days.length === 0) return null;
   return (
      <Section id="activity" index="04" title={t.activity.title}>
         <ActivityPanel days={activity.days} login={activity.login} locale={lang} labels={t.activity} />
      </Section>
   );
}
