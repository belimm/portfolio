import React from 'react';
import styles from './ProjectCard.module.css';

type ProjectCardProps = {
   src: string;
   h3: string;
   p: string;
   paragraph?: string;
   link?: string;
   url?: string;
   technologies?: string[];
   isLongParagraph?: boolean;
   onProjectClick?: () => void | undefined;
};

export default function ProjectCard({
   src,
   h3,
   p,
   paragraph,
   link,
   url,
   technologies,
   isLongParagraph,
   onProjectClick,
}: ProjectCardProps) {
   const Wrapper = link || url ? 'a' : 'div';
   const href = link || url;

   const handleClick = (e: React.MouseEvent) => {
      if (onProjectClick) {
         onProjectClick();
      }
   };

   return (
      <Wrapper
         href={href}
         className={styles.card}
         target={href ? '_blank' : undefined}
         rel={href ? 'noopener noreferrer' : undefined}
         onClick={handleClick}>
         <img src={src} alt={h3} className={styles.image} />
         <h3 className={styles.title}>{h3}</h3>
         <p className={styles.subtitle}>{p}</p>
         {paragraph && (
            <p
               className={
                  styles.paragraph +
                  ' ' +
                  (isLongParagraph
                     ? styles.projectDescSmall
                     : styles.projectDesc)
               }>
               {paragraph}
            </p>
         )}
         {technologies && (
            <div className={styles.techList}>
               {technologies.map((tech: string, index: number) => (
                  <span key={index} className={styles.techBadge}>
                     {tech}
                  </span>
               ))}
            </div>
         )}
      </Wrapper>
   );
}
