import React, { useState, useEffect, useRef } from 'react';
import styles from './ProjectsStyles.module.css';
import ProjectCard from '../../components/ProjectCard/ProjectCard';

const projects = [
   {
      src: '/images/scalable-analyzer.png',
      link: 'https://github.com/belimm/scalable-arch-analyzer',
      h3: 'Scalable Analyzer',
      p: 'Master Thesis Project',
      paragraph:
         'My master’s thesis explores the technical and architectural challenges of transitioning from monolithic applications to microservices, with a focus on refactorability, scalability, and performance. By implementing and analyzing both architectures in practical scenarios, I evaluate the trade-offs involved in such transitions and provide insights into best practices for building scalable, maintainable systems.',
   },
   {
      src: '/images/peeka.webp',
      link: 'https://apps.apple.com/us/app/future-baby-generator-peeka/id6738985115',
      h3: 'Peeka',
      p: 'See Your Future Baby',
      paragraph:
         'Peeka is a fun and engaging mobile application I developed that uses AI to generate realistic images of what a couple’s future baby might look like. By analyzing facial features from two uploaded photos, Peeka blends them to create a lifelike baby image, offering an entertaining experience powered by machine learning and computer vision.',
   },
   {
      src: '/images/fibabanka-logo.avif',
      h3: 'Fibabanka',
      p: 'Retail Banking',
      paragraph:
         "Engineered instant credit systems for major e-wallets and e-commerce platforms like Trendyol, developing scalable APIs and dynamic frontend interfaces for seamless financial transactions. Built secure, high-performance banking solutions using Java Enterprise, Spring Boot, React, TypeScript, Git, and SVN to power Türkiye's digital finance ecosystem.",
      url: 'https://www.fibabanka.com.tr/en/personal/loans/consumer-loan',
   },
   {
      src: '/images/eatwell2earn.jpg',
      link: 'https://github.com/belimm/eatwell-2-earn',
      h3: 'EatWell2Earn',
      p: 'Eatwell To Earn',
      paragraph:
         'EatWell2Earn is a Web3-powered Telegram Mini App I developed on the TON blockchain. The app lets users upload photos of their meals, analyzes the nutritional quality using AI, and rewards them based on their nutritional score. By combining AI-driven health insights with blockchain-based incentives, EatWell2Earn promotes healthy eating habits in a fun and rewarding way.',
   },
];

export default function Projects() {
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
                     idx === activeIndex ? styles.projectCardActive : styles.projectCardBlur
                  }`}
                  onClick={() => handleSlide(idx)}
                  tabIndex={0}
                  aria-label={`Show project ${project.h3}`}
               >
                  <ProjectCard {...project} />
               </div>
            ))}
         </div>
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
