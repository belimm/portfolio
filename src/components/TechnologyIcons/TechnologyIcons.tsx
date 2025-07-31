'use client';

import React, { useState } from 'react';
import {
   SiReact,
   SiJavascript,
   SiNodedotjs,
   SiSpringboot,
   SiGo,
   SiMysql,
   SiMongodb,
   SiFirebase,
   SiDocker,
   SiAmazon,
   SiGit,
} from 'react-icons/si';
import { FaJava } from 'react-icons/fa';
import { SiReactrouter } from 'react-icons/si';
import styles from './TechnologyIcons.module.css';

interface TechnologyIconsProps {
   isVisible?: boolean;
}

const skills = [
   { name: 'React', level: 9 },
   { name: 'TypeScript', level: 8 },
   { name: 'CSS', level: 7 },
   // Add more skills here
];

function getBarColor(level: number) {
   if (level >= 8) return '#006400'; // dark green
   if (level >= 6) return '#32CD32'; // light green
   if (level >= 4) return '#FFD700'; // yellow
   if (level >= 2) return '#FFA500'; // orange
   return '#FF4500'; // red
}

const TechnologyIcons: React.FC<TechnologyIconsProps> = ({
   isVisible = false,
}) => {
   const [hovered, setHovered] = useState<number | null>(null);

   const technologies = [
      { name: 'React', level: 9, icon: SiReact, color: '#61DAFB' },
      { name: 'React Native', level: 9, icon: SiReactrouter, color: '#61DAFB' },
      { name: 'JavaScript', level: 9, icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Node.js', level: 9, icon: SiNodedotjs, color: '#339933' },
      { name: 'Java', level: 9, icon: FaJava, color: '#ED8B00' },
      { name: 'Spring Boot', level: 9, icon: SiSpringboot, color: '#6DB33F' },
      { name: 'Go', level: 9, icon: SiGo, color: '#00ADD8' },
      { name: 'SQL', level: 9, icon: SiMysql, color: '#4479A1' },
      { name: 'NoSQL', level: 9, icon: SiMongodb, color: '#47A248' },
      { name: 'Firebase', level: 9, icon: SiFirebase, color: '#FFCA28' },
      { name: 'Docker', level: 9, icon: SiDocker, color: '#2496ED' },
      { name: 'AWS', level: 9, icon: SiAmazon, color: '#FF9900' },
      { name: 'Git', level: 9, icon: SiGit, color: '#F05032' },
   ];

   if (!isVisible) return null;

   return (
      <div className={styles.container}>
         <div className={styles.arrowHint}>
            <span className={styles.blinkingArrow}>&larr;</span>
         </div>
         <div className={styles.iconsGrid}>
            {technologies.map((tech, index) => (
               <div
                  key={tech.name}
                  className={styles.techItem}
                  style={{ animationDelay: `${index * 0.1}s` }}>
                  <tech.icon
                     size={24}
                     color={tech.color}
                     className={styles.icon}
                  />
               </div>
            ))}
         </div>
         <div className={styles.iconsContainer}>
            {skills.map((skill, idx) => (
               <div
                  key={skill.name}
                  className={styles.iconWrapper}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                     color: hovered === idx ? '#000' : '#888',
                     position: 'relative',
                     display: 'inline-block',
                     margin: '0 1rem',
                  }}>
                  {hovered === idx && (
                     <div className={styles.tooltip}>
                        <div>{skill.name}</div>
                        <div className={styles.barContainer}>
                           <div
                              className={styles.bar}
                              style={{
                                 width: `${(skill.level / 10) * 100}%`,
                                 background: getBarColor(skill.level),
                              }}
                           />
                           <span className={styles.levelText}>
                              {skill.level}/10
                           </span>
                        </div>

                        <div
                           style={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              background: hovered === idx ? '#eee' : '#333',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 24,
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'background 0.2s',
                           }}>
                           {skill.name[0]}
                        </div>
                     </div>          
                  )}
               </div>
            ))}
         </div>
      </div>
   );
};

export default TechnologyIcons;
