// TechnologyIcons.tsx
'use client';

import React, { useState } from 'react';
// import TechnologyModal from '../TechnologyModal/TechnologyModal';
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

const TechnologyIcons: React.FC<TechnologyIconsProps> = ({
   isVisible = false,
}) => {
   const [popupData, setPopupData] = useState<{
      tech: string;
      level: number;
      projects: string[];
      position: { top: number; left: number };
   } | null>(null);

   const technologies = [
      { name: 'React', level: 9, icon: SiReact, color: '#61DAFB' },
      { name: 'React Native', level: 9, icon: SiReactrouter, color: '#61DAFB' },
      { name: 'JavaScript', level: 9, icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Node.js', level: 9, icon: SiNodedotjs, color: '#339933' },
      { name: 'Java', level: 8, icon: FaJava, color: '#ED8B00' },
      { name: 'Spring Boot', level: 8, icon: SiSpringboot, color: '#6DB33F' },
      { name: 'Go', level: 6, icon: SiGo, color: '#00ADD8' },
      { name: 'SQL', level: 8, icon: SiMysql, color: '#4479A1' },
      { name: 'NoSQL', level: 8, icon: SiMongodb, color: '#47A248' },
      { name: 'Firebase', level: 9, icon: SiFirebase, color: '#FFCA28' },
      { name: 'Docker', level: 8, icon: SiDocker, color: '#2496ED' },
      { name: 'AWS', level: 7, icon: SiAmazon, color: '#FF9900' },
      { name: 'Git', level: 9, icon: SiGit, color: '#F05032' },
   ];

   function getRelatedProjects(techName: string): string[] {
      const techProjectMap: { [key: string]: string[] } = {
         React: ['Fibabanka', 'EatWell2Earn', 'Porfolio'],
         'React Native': ['Peeka', 'ArmorUp'],
         JavaScript: ['Fibabanka', 'Peeka', 'EatWell2Earn'],
         'Node.js': ['Peeka', 'ArmorUp', 'EatWell2Earn'],
         Java: ['Fibabanka', 'Scalable Analyzer'],
         'Spring Boot': ['Fibabanka', 'Scalable Analyzer'],
         NoSQL: ['Mirana', 'Peeka', 'ArmorUp'],
         Firebase: ['Peeka', 'ArmorUp'],
         Docker: ['Fibabanka', 'Mirana', 'Scalable Analyzer'],
         AWS: ['Mirana', 'EatWell2Earn'],
         Git: ['All Projects'],
      };
      return techProjectMap[techName] || ['No related projects'];
   }

   if (!isVisible) return null;

   return (
      <div className={styles.container}>
         <div className={styles.arrowHint}>
            <span className={styles.blinkingArrow}>↓</span>
         </div>
         <div className={styles.iconsGrid}>
            {technologies.map((tech, index) => (
               <div
                  key={tech.name}
                  className={styles.techItem}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={(e) => {
                     const rect = (
                        e.currentTarget as HTMLElement
                     ).getBoundingClientRect();
                     // Determine if this icon is in the leftmost column (index % 3 === 0)
                     const isLeftCol = index % 3 === 0;
                     setPopupData({
                        tech: tech.name,
                        level: tech.level,
                        projects: getRelatedProjects(tech.name),
                        position: {
                           top: rect.top + window.scrollY + rect.height + 8,
                           left: isLeftCol
                              ? rect.left * 1.5 +
                                window.scrollX +
                                rect.width / 2
                              : rect.left + window.scrollX + rect.width / 2,
                        },
                     });
                  }}
                  onMouseLeave={() =>
                     setTimeout(() => setPopupData(null), 300)
                  }>
                  <tech.icon
                     size={24}
                     color={tech.color}
                     className={styles.icon}
                  />
               </div>
            ))}
         </div>

         {popupData && (
            <div
               className={styles.tooltip}
               style={{
                  position: 'absolute',
                  top: popupData.position.top,
                  left: popupData.position.left,
                  transform: 'translate(-50%, 0)',
                  zIndex: 100,
               }}
               onMouseEnter={() => {}}
               onMouseLeave={() => setPopupData(null)}>
               <div
                  style={{
                     fontWeight: 600,
                     fontSize: '1rem',
                     marginBottom: 4,
                  }}>
                  {popupData.tech}
               </div>
               <div
                  style={{
                     display: 'flex',
                     alignItems: 'center',
                     marginBottom: 4,
                  }}>
                  <div
                     style={{
                        width: 80,
                        height: 12,
                        borderRadius: 6,
                        marginRight: 8,
                        background: '#333',
                        overflow: 'hidden',
                        border: '1px solid #222',
                     }}>
                     <div
                        style={{
                           width: `${
                              Math.max(0, Math.min(10, popupData.level)) * 10
                           }%`,
                           height: '100%',
                           borderRadius: 6,
                           background:
                              popupData.level < 5
                                 ? '#FFD600'
                                 : popupData.level < 7
                                 ? '#AEEA00'
                                 : '#00C853',
                           transition: 'width 0.3s',
                        }}
                     />
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#fff' }}>
                     Level: {popupData.level}
                  </span>
               </div>
               <div style={{ fontSize: '0.9rem' }}>
                  Projects: {popupData.projects.join(', ')}
               </div>
            </div>
         )}
      </div>
   );
};

export default TechnologyIcons;
