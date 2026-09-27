import { TerminalProvider } from '../../contexts/TerminalContext';
import { getContent } from '../../lib/content';
import { getDictionary, Locale } from '../../lib/i18n';
import Header from './Header';
import Hero from './Hero';
import Work from './Work';
import Experience from './Experience';
import Skills from './Skills';
import Contact from './Contact';
import Footer from './Footer';

export default async function HomePage({ lang }: { lang: Locale }) {
   const t = getDictionary(lang);
   const { profile, projects, experience, skills, updated_at } = await getContent(lang);

   return (
      <div lang={lang}>
         <TerminalProvider
            initialEntries={[
               { command: 'whoami', output: `${profile.name}, ${profile.role.toLocaleLowerCase(lang)}` },
            ]}>
            <Header name={profile.name} lang={lang} t={t} />
            <main>
               <Hero profile={profile} t={t} />
               <Work projects={projects} t={t} />
               <Experience items={experience} t={t} />
               <Skills groups={skills} t={t} />
               <Contact profile={profile} t={t} />
            </main>
            <Footer name={profile.name} updatedAt={updated_at} lang={lang} t={t} />
         </TerminalProvider>
      </div>
   );
}
