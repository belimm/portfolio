import { ExperienceItem } from '../../lib/content';
import { Dictionary } from '../../lib/i18n';
import Section, { stagger } from './Section';
import TrackedLink from './TrackedLink';
import styles from './Experience.module.css';

const host = (url: string) => {
   try {
      return new URL(url).hostname.replace(/^www\./, '');
   } catch {
      return url;
   }
};

function Entry({ item, at, n }: { item: ExperienceItem; at: string; n: number }) {
   const range = [item.start, item.end].filter(Boolean).join(' – ');
   const title = (
      <span className="fill">
         {item.title}
         {item.organization && (
            <>
               <span className={styles.at}> {at} </span>
               {item.organization}
            </>
         )}
      </span>
   );
   return (
      <li className={`${styles.entry} sr fill-by`} style={stagger(n, 220)}>
         <p className={styles.dates}>{range}</p>
         <div>
            <h3 className={styles.role}>
               {item.link ? (
                  <TrackedLink
                     href={item.link}
                     className={styles.link}
                     log={{ command: `open ${host(item.link)}`, output: `Opened ${item.organization || item.title}` }}>
                     {title}
                     <span className={styles.arrow} aria-hidden="true">
                        ↗
                     </span>
                  </TrackedLink>
               ) : (
                  title
               )}
            </h3>
            {item.location && <p className={styles.location}>{item.location}</p>}
            {item.summary && <p className={styles.summary}>{item.summary}</p>}
            {item.highlights.length > 0 && (
               <ul className={styles.highlights}>
                  {item.highlights.map((h) => (
                     <li key={h}>{h}</li>
                  ))}
               </ul>
            )}
         </div>
      </li>
   );
}

export default function Experience({ items, t }: { items: ExperienceItem[]; t: Dictionary }) {
   const work = items.filter((i) => i.kind === 'work');
   const education = items.filter((i) => i.kind === 'education');
   if (items.length === 0) return null;

   return (
      <Section id="experience" index="02" title={t.experience.title}>
         <ol className={styles.list}>
            {work.map((item, i) => (
               <Entry key={item.id ?? item.title} item={item} at={t.experience.at} n={i} />
            ))}
         </ol>
         {education.length > 0 && (
            <>
               <h3 className={styles.subhead}>{t.experience.education}</h3>
               <ol className={styles.list}>
                  {education.map((item, i) => (
                     <Entry key={item.id ?? item.title} item={item} at={t.experience.at} n={i} />
                  ))}
               </ol>
            </>
         )}
      </Section>
   );
}
