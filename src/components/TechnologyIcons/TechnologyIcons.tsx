'use client';

import React from 'react';
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
   const technologies = [
      { name: 'React', icon: SiReact, color: '#61DAFB' },
      { name: 'React Native', icon: SiReactrouter, color: '#61DAFB' },
      { name: 'JavaScript', icon: SiJavascript, color: '#F7DF1E' },
      { name: 'Node.js', icon: SiNodedotjs, color: '#339933' },
      { name: 'Java', icon: FaJava, color: '#ED8B00' },
      { name: 'Spring Boot', icon: SiSpringboot, color: '#6DB33F' },
      { name: 'Go', icon: SiGo, color: '#00ADD8' },
      { name: 'SQL', icon: SiMysql, color: '#4479A1' },
      { name: 'NoSQL', icon: SiMongodb, color: '#47A248' },
      { name: 'Firebase', icon: SiFirebase, color: '#FFCA28' },
      { name: 'Docker', icon: SiDocker, color: '#2496ED' },
      { name: 'AWS', icon: SiAmazon, color: '#FF9900' },
      { name: 'Git', icon: SiGit, color: '#F05032' },
   ];

   if (!isVisible) return null;

   return (
      <div className={styles.container}>
         <h3 className={styles.title}>Technologies I Work With</h3>
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
      </div>
   );
};

export default TechnologyIcons;
