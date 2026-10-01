import { ExperienceItem } from '../../lib/content';
import { parseSpan, spanMonths, totalMonths } from '../../lib/duration';
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

function Entry({ item, t, n }: { item: ExperienceItem; t: Dictionary['experience']; n: number }) {
   const at = t.at;
   const range = [item.start, item.end].filter(Boolean).join(' – ');
   // Time spent, for jobs only: counted from the dates typed in the admin, up to today for "Present".
   const span = item.kind === 'work' ? parseSpan(item.start, item.end) : null;
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
         <p className={styles.dates}>
            {range}
            {span && <span className={styles.duration}>{t.duration(spanMonths(span))}</span>}
         </p>
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

   // Time in the field: every job's span, overlapping jobs counted once.
   const spans = work.flatMap((i) => parseSpan(i.start, i.end) ?? []);
   const total = totalMonths(spans);

   return (
      <Section
         id="experience"
         index="02"
         title={t.experience.title}
         aside={
            total > 0 && (
               <p className={styles.total}>
                  {t.experience.total}
                  <strong>{t.experience.duration(total)}</strong>
               </p>
            )
         }>
         <ol className={styles.list}>
            {work.map((item, i) => (
               <Entry key={item.id ?? item.title} item={item} t={t.experience} n={i} />
            ))}
         </ol>
         {education.length > 0 && (
            <>
               <h3 className={styles.subhead}>{t.experience.education}</h3>
               <ol className={styles.list}>
                  {education.map((item, i) => (
                     <Entry key={item.id ?? item.title} item={item} t={t.experience} n={i} />
                  ))}
               </ol>
            </>
         )}
      </Section>
   );
}
