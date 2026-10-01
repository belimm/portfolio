import React from 'react';
import DeveloperTerminal from '../DeveloperTerminal/DeveloperTerminal';
import { Profile } from '../../lib/content';
import { Dictionary } from '../../lib/i18n';
import BinaryField from './BinaryField';
import CvButton from './CvButton';
import HeroLens from './HeroLens';
import Highlight from './Highlight';
import SocialIcon from './SocialIcon';
import TrackedLink from './TrackedLink';
import styles from './Hero.module.css';

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as React.CSSProperties;

export default function Hero({
   profile,
   t,
   pulse,
}: {
   profile: Profile;
   t: Dictionary;
   /** One-line summary of recent GitHub contributions, linking down to the GitHub section. Null when that section is left out. */
   pulse?: string | null;
}) {
   const handle = profile.github_url.split('/').filter(Boolean).pop() ?? 'berk';

   return (
      <section className={styles.hero} id="top">
         <BinaryField variant="hero" direction="up" />
         <HeroLens />
         <div className={styles.inner} data-lens-source>
            <div className={styles.text}>
               <p className={`${styles.kicker} fade-up`}>
                  {profile.role}
                  {profile.location && <> · {profile.location.split(',')[0]}</>}
               </p>
               <h1 className={styles.statement}>
                  <Highlight text={profile.intro} reveal />
               </h1>
               {profile.about && (
                  <p className={`${styles.about} fade-up`} style={delay(650)}>
                     {profile.about}
                  </p>
               )}

               <div className={`${styles.actions} fade-up`} style={delay(800)}>
                  {profile.cv_url && (
                     <CvButton
                        url={profile.cv_url}
                        className={styles.primary}
                        label={t.hero.readCv}
                        logOutput={t.hero.openedCv}
                        labels={t.cv}
                     />
                  )}
                  <a href="#contact" className={styles.secondary}>
                     {t.hero.getInTouch}
                  </a>
               </div>

               <ul className={`${styles.links} fade-up`} style={delay(900)}>
                  {profile.github_url && (
                     <li>
                        <TrackedLink
                           href={profile.github_url}
                           className={styles.withIcon}
                           log={{ command: `open github.com/${handle}`, output: t.hero.openedGithub }}>
                           <SocialIcon name="github" size={16} />
                           GitHub ↗
                        </TrackedLink>
                     </li>
                  )}
                  {profile.linkedin_url && (
                     <li>
                        <TrackedLink
                           href={profile.linkedin_url}
                           className={styles.withIcon}
                           log={{ command: 'open linkedin', output: t.hero.openedLinkedin }}>
                           <SocialIcon name="linkedin" size={16} />
                           LinkedIn ↗
                        </TrackedLink>
                     </li>
                  )}
               </ul>

               {pulse && (
                  <a href="#github" className={`${styles.pulse} fade-up`} style={delay(950)}>
                     {pulse} ↓
                  </a>
               )}
            </div>

            <aside className={`${styles.side} fade-up`} style={delay(1000)}>
               {profile.available && profile.availability_note && (
                  <p className={styles.status}>{profile.availability_note}</p>
               )}
               <DeveloperTerminal title={`${handle}@istanbul: ~`} label={t.terminal.label} />
            </aside>
         </div>
      </section>
   );
}
