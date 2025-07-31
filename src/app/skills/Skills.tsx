import TechnologyIcons from '@/components/TechnologyIcons/TechnologyIcons';
import styles from './SkillsStyles.module.css';
import React from 'react';

export default function Skills() {
   return (
      <div className={styles.container}>
         <div className={styles.sectionTitle}>
            <h2 className={styles.skillsTitle}>Skills</h2>
            <TechnologyIcons isVisible={true} />
         </div>
      </div>
   );
}
