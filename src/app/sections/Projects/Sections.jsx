import styles from './ProjectsStyles.module.css';
//import vetQualityAssurance from '../../assets/vetQualityAssurance.png';
import logoGOPA from '../../assets/logo-gopa-share.png';
import scalable_analyzer from '../../assets/scalable-analyzer.png';
import peeka from '../../assets/peeka.webp';
import fibabanka from '../../assets/fibabanka-logo.avif';
import eatwell2earn from '../../assets/eatwell2earn.jpg';

import ProjectCard from '../../common/ProjectCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

function Projects() {
   return (
      <section id="projects" className={styles.container}>
         <h1 className="sectionTitle">Projects</h1>
         <Swiper
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
               640: { slidesPerView: 1 },
               768: { slidesPerView: 2 },
               1024: { slidesPerView: 3 },
            }}
            style={{
               padding: '2rem 0',
               width: '100%',
               maxWidth: '1200px',
               margin: '0 auto',
            }}
            centeredSlides={true}
            modules={[Pagination]}
            pagination={{ clickable: true }}>
            <SwiperSlide>
               <ProjectCard
                  src={logoGOPA}
                  h3="EU VET Quality Assurance"
                  p="Vocational Education Reform in TRNC"
                  paragraph="Aligned 12 Cypriot vocational schools with EU standards (EQAVET/ECVET) under the EU Aid Programme. Developed accreditation frameworks and trained 50+ administrators. Technologies: Quality assurance databases, EU compliance tools."
                  url="https://www.gopa.de/"
               />
            </SwiperSlide>
            <SwiperSlide>
               <ProjectCard
                  src={scalable_analyzer}
                  link="https://github.com/belimm/scalable-arch-analyzer"
                  h3="Scalable Analyzer"
                  p="Master Thesis Project"
               />
            </SwiperSlide>
            <SwiperSlide>
               <ProjectCard
                  src={peeka}
                  link="https://apps.apple.com/us/app/future-baby-generator-peeka/id6738985115"
                  h3="Peeka"
                  p="See Your Future Baby"
               />
            </SwiperSlide>
            <SwiperSlide>
               <ProjectCard
                  src={fibabanka}
                  h3="Fibabanka"
                  p="Retail Banking"
                  paragraph="Engineered instant credit systems for major e-wallets and\ne-commerce platforms like Trendyol, developing scalable APIs\nand dynamic frontend interfaces for seamless financial\ntransactions. Built secure, high-performance banking solutions\nusing Java Enterprise, Spring Boot, React, TypeScript, Git,\nand SVN to power Türkiye's digital finance ecosystem. 🚀"
                  url="https://www.fibabanka.com.tr/en/personal/loans/consumer-loan"
               />
            </SwiperSlide>
            <SwiperSlide>
               <ProjectCard
                  src={eatwell2earn}
                  link="https://github.com/belimm/eatwell-2-earn"
                  h3="EatWell2Earn"
                  description="Eatwell To Earn"
               />
            </SwiperSlide>
         </Swiper>
      </section>
   );
}

export default Projects;
