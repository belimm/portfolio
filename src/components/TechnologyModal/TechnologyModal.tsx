'use client';

import React, { useEffect, useState } from 'react';
import styles from './TechnologyModal.module.css';

interface TechnologyModalProps {
   techName: string;
   level: number;
   projects: string[];
   onClose: () => void;
}

function getBarColor(level: number) {
   if (level >= 7) return '#006400'; // dark green
   if (level >= 5) return '#9cd19cff'; // light green
   return '#FFD700'; // yellow
}

const TechnologyModal: React.FC<TechnologyModalProps> = ({
   techName,
   level,
   projects,
   onClose,
}) => {
   const [numberOfProjects, setNumberOfProjects] = useState(projects.length);

   useEffect(() => {
      console.log(
         `Technology: ${techName}, Level: ${level}, Projects: ${projects.join(
            ', '
         )}`
      );
      setNumberOfProjects(projects.length);
      console.log(`Number of projects: ${numberOfProjects}`);
   }, [techName, level, projects]);

   return (
      <div className={styles.overlay} onClick={onClose}>
         <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={onClose}>
               ×
            </button>
            <h3>{techName}</h3>
            <div className={styles.barWrapper}>
               <div className={styles.barContainer}>
                  <div
                     className={styles.bar}
                     style={{
                        width: `${(level / 10) * 100}%`,
                        background: getBarColor(level),
                     }}
                  />
               </div>
               <span className={styles.levelText}>{level}/10</span>
            </div>
            {numberOfProjects > 0 && <h4>Related Projects</h4>}

            <ul className={styles.projectList}>
               {projects.map((proj, idx) => (
                  <li key={idx}>{proj}</li>
               ))}
            </ul>
         </div>
      </div>
   );
};

export default TechnologyModal;
