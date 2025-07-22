import styles from './ProjectsStyles.module.css';
import scalable_analyzer from '../../assets/scalable-analyzer.png';
import peeka from '../../assets/peeka.webp';
import fibabanka from '../../assets/fibabanka-logo.avif';
import eatwell2earn from '../../assets/eatwell2earn.jpg';

import ProjectCard from '../../common/ProjectCard';

function Projects() {
   return (
      <section id="projects" className={styles.container}>
         <h1 className="sectionTitle">Projects</h1>
         <div className={styles.projectsContainer}>
           

            <ProjectCard
               src={scalable_analyzer}
               link="https://github.com/belimm/scalable-arch-analyzer"
               h3="Scalable Analyzer"
               p="Master Thesis Project"
            />
            <ProjectCard
               src={peeka}
               link="https://apps.apple.com/us/app/future-baby-generator-peeka/id6738985115"
               h3="Peeka"
               p="See Your Future Baby"
            />
            <ProjectCard
               src={fibabanka}
               h3="Fibabanka"
               p="Retail Banking"
               paragraph="Engineered instant credit systems for major e-wallets and
                  e-commerce platforms like Trendyol, developing scalable APIs
                  and dynamic frontend interfaces for seamless financial
                  transactions. Built secure, high-performance banking solutions
                  using Java Enterprise, Spring Boot, React, TypeScript, Git,
                  and SVN to power Türkiye's digital finance ecosystem. 🚀"
               url="https://www.fibabanka.com.tr/en/personal/loans/consumer-loan"
            />
            <ProjectCard
               src={eatwell2earn}
               link="https://github.com/belimm/eatwell-2-earn"
               h3="EatWell2Earn"
               description="Eatwell To Earn"
            />
         </div>
      </section>
   );
}

export default Projects;
