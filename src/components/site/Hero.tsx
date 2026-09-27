import React from 'react';
import DeveloperTerminal from '../DeveloperTerminal/DeveloperTerminal';
import { Profile } from '../../lib/content';
import { Dictionary } from '../../lib/i18n';
import BinaryField from './BinaryField';
import CvButton from './CvButton';
import Highlight from './Highlight';
import TrackedLink from './TrackedLink';
import styles from './Hero.module.css';

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as React.CSSProperties;

export default function Hero({ profile, t }: { profile: Profile; t: Dictionary }) {
   const handle = profile.github_url.split('/').filter(Boolean).pop() ?? 'berk';

   return (
      <section className={styles.hero} id="top">
         <BinaryField variant="hero" direction="up" />
         <div className={styles.inner}>
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
                           log={{ command: `open github.com/${handle}`, output: t.hero.openedGithub }}>
                           GitHub ↗
                        </TrackedLink>
                     </li>
                  )}
                  {profile.linkedin_url && (
                     <li>
                        <TrackedLink
                           href={profile.linkedin_url}
                           log={{ command: 'open linkedin', output: t.hero.openedLinkedin }}>
                           LinkedIn ↗
                        </TrackedLink>
                     </li>
                  )}
                  {profile.email && (
                     <li>
                        <TrackedLink
                           href={`mailto:${profile.email}`}
                           log={{ command: `mail ${profile.email}`, output: t.hero.openedMail }}>
                           {profile.email}
                        </TrackedLink>
                     </li>
                  )}
               </ul>
            </div>

            <aside className={`${styles.side} fade-up`} style={delay(1000)}>
               {profile.available && profile.availability_note && (
                  <p className={styles.status}>{profile.availability_note}</p>
               )}
               <DeveloperTerminal title={`${handle}@berlin: ~`} label={t.terminal.label} />
            </aside>
         </div>
      </section>
   );
}
