import { TerminalProvider } from '../../contexts/TerminalContext';
import { getContent } from '../../lib/content';
import { getGithubActivity, githubLogin, summarize } from '../../lib/github';
import { getDictionary, Locale } from '../../lib/i18n';
import Header from './Header';
import Hero from './Hero';
import Work from './Work';
import Experience from './Experience';
import Skills from './Skills';
import Activity from './Activity';
import Contact from './Contact';
import Footer from './Footer';

/** The GitHub window shown by default: in the hero line, the header card and the section. */
const RECENT_MONTHS = 3;

export default async function HomePage({ lang }: { lang: Locale }) {
   const t = getDictionary(lang);
   const { profile, projects, experience, skills, updated_at } = await getContent(lang);
   const activity = await getGithubActivity(githubLogin(profile.github_url));

   const summary = activity && activity.days.length > 0 ? summarize(activity.days, RECENT_MONTHS) : null;
   const pulse = summary
      ? t.hero.pulse(new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-GB').format(summary.total), RECENT_MONTHS)
      : null;

   return (
      <div lang={lang}>
         <TerminalProvider
            initialEntries={[
               { command: 'whoami', output: `${profile.name}, ${profile.role.toLocaleLowerCase(lang)}` },
            ]}>
            <Header
               name={profile.name}
               lang={lang}
               t={t}
               github={profile.github_url}
               linkedin={profile.linkedin_url}
               githubPeek={summary && activity ? { summary, login: activity.login, months: RECENT_MONTHS } : null}
            />
            <main>
               <Hero profile={profile} t={t} pulse={pulse} />
               <Work projects={projects} t={t} />
               <Experience items={experience} t={t} />
               <Skills groups={skills} t={t} />
               <Activity activity={activity} lang={lang} t={t} months={RECENT_MONTHS} />
               <Contact profile={profile} t={t} />
            </main>
            <Footer name={profile.name} updatedAt={updated_at} lang={lang} t={t} />
         </TerminalProvider>
      </div>
   );
}
