import React, { useState, useEffect, useRef } from 'react';
import styles from './ProjectsStyles.module.css';
import ProjectCard from '../../components/ProjectCard/ProjectCard';
import { useTerminal } from '../../contexts/TerminalContext';

const projects = [
   {
      src: '/images/scalable-analyzer.png',
      link: '/thesis.pdf',
      h3: 'Scalable Analyzer',
      p: 'Master Thesis Project',
      paragraph:
         'My masters thesis explores the technical and architectural challenges of transitioning from monolithic applications to microservices, with a focus on refactorability, scalability, and performance. By implementing and analyzing both architectures in practical scenarios, I evaluate the trade-offs involved in such transitions and provide insights into best practices for building scalable, maintainable systems.',
      technologies: ['Java', 'Spring Boot', 'Docker'],
   },
   {
      src: '/images/peeka.webp',
      link: 'https://apps.apple.com/us/app/future-baby-generator-peeka/id6738985115',
      h3: 'Peeka',
      p: 'See Your Future Baby',
      paragraph:
         'Peeka is a fun and engaging mobile application I developed that uses AI to generate realistic images of what a couple’s future baby might look like. By analyzing facial features from two uploaded photos, Peeka blends them to create a lifelike baby image, offering an entertaining experience powered by machine learning and computer vision.',
      technologies: ['React', 'Firebase', 'JavaScript'],
   },
   {
      src: '/images/fibabanka-logo.avif',
      h3: 'Fibabanka',
      p: 'Retail Banking',
      paragraph:
         "Engineered instant credit systems for major e-wallets and e-commerce platforms like Trendyol, developing scalable APIs and dynamic frontend interfaces for seamless financial transactions. Built secure, high-performance banking solutions using Java Enterprise, Spring Boot, React, TypeScript, Git, and SVN to power Türkiye's digital finance ecosystem.",
      url: 'https://www.fibabanka.com.tr/en/personal/loans/consumer-loan',
      technologies: ['Java', 'Spring Boot', 'React', 'TypeScript'],
   },
   {
      src: '/images/eatwell2earn.jpg',
      link: 'https://github.com/belimm/eatwell-2-earn',
      h3: 'EatWell2Earn',
      p: 'Eatwell To Earn',
      paragraph:
         'EatWell2Earn is a Web3-powered Telegram Mini App I developed on the TON blockchain. The app lets users upload photos of their meals, analyzes the nutritional quality using AI, and rewards them based on their nutritional score. By combining AI-driven health insights with blockchain-based incentives, EatWell2Earn promotes healthy eating habits in a fun and rewarding way.',
      technologies: ['React', 'Node.js', 'AWS', 'JavaScript'],
   },
];

export default function Projects() {
   const { addTerminalEntry } = useTerminal();
   const [activeIndex, setActiveIndex] = useState(0);
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
   const sectionRef = useRef<HTMLElement | null>(null);
   const [isAnimated, setIsAnimated] = useState(false);

   // Auto-slide every 4 seconds
   useEffect(() => {
      timeoutRef.current = setTimeout(() => {
         setActiveIndex((prev) => (prev + 1) % projects.length);
      }, 4000);
      return () => {
         if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
   }, [activeIndex]);

   // Animation on section enter
   useEffect(() => {
      const observer = new window.IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setIsAnimated(true);
            } else {
               setIsAnimated(false); // Reset when out of view
            }
         },
         { threshold: 0.2 }
      );
      if (sectionRef.current) observer.observe(sectionRef.current);
      return () => observer.disconnect();
   }, []);

   // Manual slide
   const handleSlide = (idx: number) => {
      setActiveIndex(idx);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
   };

   // Handle project click to add terminal entry for each project
   const handleProjectClick = (project: typeof projects[0]) => {
      switch (project.h3) {
         case 'Scalable Analyzer':
            addTerminalEntry({
               command: 'curl -X GET https://berk.dev/thesis.pdf',
               output: 'Opened project Scalable Analyzer in new tab...',
            });
            break;
         case 'Peeka':
            addTerminalEntry({
               command: 'curl -X GET https://apps.apple.com/peeka',
               output: 'Opened project Peeka in new tab...',
            });
            break;
         case 'Fibabanka':
            addTerminalEntry({
               command: 'curl -X GET https://www.fibabanka.com.tr',
               output: 'Opened project Fibabanka in new tab...',
            });
            break;
         case 'EatWell2Earn':
            addTerminalEntry({
               command: 'curl -X GET https://github.com/belimm/eatwell-2-earn',
               output: 'Opened project EatWell2Earn in new tab...',
            });
            break;
         default:
            break;
      }
   };

   return (
      <section
         id="projects"
         className={`${styles.container} ${isAnimated ? styles.animate : ''}`}
         ref={sectionRef}>
         <h2 className={styles.sectionTitle}>Projects</h2>
         <div className={styles.sliderWrapper}>
            {projects.map((project, idx) => (
               <div
                  key={idx}
                  className={`${styles.projectCard} ${
                     idx === activeIndex
                        ? styles.projectCardActive
                        : styles.projectCardBlur
                  }`}
                  onClick={() => handleSlide(idx)}
                  tabIndex={0}
                  aria-label={`Show project ${project.h3}`}>
                  <ProjectCard
                     {...project}
                     isLongParagraph={!!project.paragraph && project.paragraph.length > 400}
                     onProjectClick={() => handleProjectClick(project)}
                  />
               </div>
            ))}
         </div>
         {/* Dots moved outside sliderWrapper for fixed spacing */}
         <div className={styles.sliderDots}>
            {projects.map((_, idx) => (
               <button
                  key={idx}
                  onClick={() => handleSlide(idx)}
                  className={`${styles.sliderDot} ${
                     idx === activeIndex ? styles.sliderDotActive : ''
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
               />
            ))}
         </div>
      </section>
   );
}
