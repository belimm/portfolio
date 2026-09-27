import { SkillGroup } from '../../lib/content';
import { Dictionary } from '../../lib/i18n';
import Section from './Section';
import styles from './Skills.module.css';

export default function Skills({ groups, t }: { groups: SkillGroup[]; t: Dictionary }) {
   if (groups.length === 0) return null;
   return (
      <Section
         id="skills"
         index="03"
         title={t.skills.title}>
         <dl className={styles.list}>
            {groups.map((group) => (
               <div key={group.id ?? group.name} className={styles.row}>
                  <dt>{group.name}</dt>
                  <dd>{group.items.join(', ')}</dd>
               </div>
            ))}
         </dl>
      </Section>
   );
}
