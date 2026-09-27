/* eslint-disable @next/next/no-img-element -- images can come from the API's upload host */
import { Project } from '../../lib/content';
import { Dictionary } from '../../lib/i18n';
import Section from './Section';
import TrackedLink from './TrackedLink';
import styles from './Work.module.css';

function hostOf(link: string) {
   if (!link.startsWith('http')) return link.replace(/^\//, '');
   try {
      return new URL(link).hostname.replace(/^www\./, '');
   } catch {
      return link;
   }
}

function ProjectRow({ project, t }: { project: Project; t: Dictionary }) {
   const inner = (
      <>
         <div className={styles.thumb}>
            {project.image_url ? (
               <img src={project.image_url} alt="" loading="lazy" />
            ) : (
               <span className={styles.initial}>{project.title.charAt(0)}</span>
            )}
         </div>
         <div className={styles.main}>
            <h3 className={styles.title}>
               {project.title}
               {project.link && <span className={styles.arrow} aria-hidden="true">↗</span>}
            </h3>
            {project.subtitle && <p className={styles.subtitle}>{project.subtitle}</p>}
            {project.description && <p className={styles.description}>{project.description}</p>}
            {project.tags.length > 0 && (
               <p className={styles.tags}>
                  <span className="visually-hidden">{t.work.builtWith}</span>
                  {project.tags.join(' · ')}
               </p>
            )}
         </div>
         <div className={styles.meta}>
            {project.year && <span>{project.year}</span>}
            {project.link && <span className={styles.host}>{hostOf(project.link)}</span>}
         </div>
      </>
   );

   if (!project.link) return <div className={styles.row}>{inner}</div>;

   return (
      <TrackedLink
         href={project.link}
         className={`${styles.row} ${styles.linked}`}
         log={{
            command: `open ${hostOf(project.link)}`,
            output: t.work.opened(project.title),
         }}>
         {inner}
      </TrackedLink>
   );
}

export default function Work({ projects, t }: { projects: Project[]; t: Dictionary }) {
   if (projects.length === 0) return null;
   return (
      <Section
         id="work"
         index="01"
         title={t.work.title}>
         <ul className={styles.list}>
            {projects.map((project) => (
               <li key={project.id ?? project.title}>
                  <ProjectRow project={project} t={t} />
               </li>
            ))}
         </ul>
      </Section>
   );
}
