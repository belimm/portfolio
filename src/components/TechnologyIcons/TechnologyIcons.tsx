// TechnologyIcons.tsx
'use client';

import React, { useState } from 'react';
import TechnologyModal from '../TechnologyModal/TechnologyModal';
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
   const [modalData, setModalData] = useState<{
      tech: string;
      level: number;
      projects: string[];
   } | null>(null);

   const technologies = [
      { name: 'React', level: 5, icon: SiReact, color: '#61DAFB' },
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

   function getRelatedProjects(techName: string): string[] {
      const techProjectMap: { [key: string]: string[] } = {
         React: ['Peeka', 'EatWell2Earn'],
         Java: ['Fibabanka', 'Scalable Analyzer'],
         Firebase: ['Peeka'],
         'Spring Boot': ['Fibabanka', 'Scalable Analyzer'],
         Docker: ['Scalable Analyzer'],
         AWS: ['EatWell2Earn'],
      };
      return techProjectMap[techName] || ['No related projects'];
   }

   if (!isVisible) return null;

   return (
      <div className={styles.container}>
         <div className={styles.iconsGrid}>
            {technologies.map((tech, index) => (
               <div
                  key={tech.name}
                  className={styles.techItem}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={
                     () => console.log('Clicked on ' + tech.name)
                     // setModalData({
                     //    tech: tech.name,
                     //    level: tech.level,
                     //    projects: getRelatedProjects(tech.name),
                     // })
                  }>
                  <tech.icon
                     size={24}
                     color={tech.color}
                     className={styles.icon}
                  />
               </div>
            ))}
         </div>

         {modalData && (
            <TechnologyModal
               techName={modalData.tech}
               level={modalData.level}
               projects={modalData.projects}
               onClose={() => setModalData(null)}
            />
         )}
      </div>
   );
};

export default TechnologyIcons;
