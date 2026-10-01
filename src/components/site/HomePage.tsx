import { Suspense } from 'react';
import { TerminalProvider } from '../../contexts/TerminalContext';
import { getContent } from '../../lib/content';
import { getGithubActivity, githubLogin } from '../../lib/github';
import { getDictionary, Locale } from '../../lib/i18n';
import Header from './Header';
import Hero from './Hero';
import Work from './Work';
import Experience from './Experience';
import Skills from './Skills';
import Activity, { ActivitySkeleton } from './Activity';
import Contact from './Contact';
import Footer from './Footer';

/** The GitHub window shown by default: in the hero line, the header card and the section. */
const RECENT_MONTHS = 3;

export default async function HomePage({ lang }: { lang: Locale }) {
   const t = getDictionary(lang);
   const { profile, projects, experience, skills, updated_at } = await getContent(lang);
   // Not awaited: the page streams, and the GitHub bits fill in (behind placeholders) when the data arrives.
   const login = githubLogin(profile.github_url);
   const activity = login ? getGithubActivity(login) : null;

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
               githubPeek={activity ? { activity, months: RECENT_MONTHS } : null}
            />
            <main>
               <Hero profile={profile} t={t} pulse={activity ? { activity, months: RECENT_MONTHS, lang } : null} />
               <Work projects={projects} t={t} />
               <Experience items={experience} t={t} />
               <Skills groups={skills} t={t} />
               {activity && (
                  <Suspense fallback={<ActivitySkeleton t={t} />}>
                     <Activity activity={activity} lang={lang} t={t} months={RECENT_MONTHS} />
                  </Suspense>
               )}
               <Contact profile={profile} t={t} />
            </main>
            <Footer name={profile.name} updatedAt={updated_at} lang={lang} t={t} />
         </TerminalProvider>
      </div>
   );
}
