import styles from './HeroStyles.module.css';
import heroImg from '../../assets/berk.png';
import sun from '../../assets/sun.svg';
import moon from '../../assets/moon.svg';
import githubLight from '../../assets/github-light.svg';
import githubDark from '../../assets/github-dark.svg';
import linkedinLight from '../../assets/linkedin-light.svg';
import linkedinDark from '../../assets/linkedin-dark.svg';
import CV from '../../assets/cv.pdf';
import { useTheme } from '../../common/ThemeContext';

function Hero() {
   const { theme, toggleTheme } = useTheme();

   const themeIcon = theme === 'light' ? sun : moon;
   const githubIcon = theme === 'light' ? githubLight : githubDark;
   const linkedinIcon = theme === 'light' ? linkedinLight : linkedinDark;

   return (
      <section id="hero" className={styles.container}>
         <div className={styles.colorModeContainer}>
            <img
               src={heroImg}
               className={styles.hero}
               alt="Profile picture of Berk Limoncu"
               style={{
                  width: '512px',
                  height: '512px',
                  borderRadius: '50%',
                  objectFit: 'cover',
               }}
            />
            <img
               className={styles.colorMode}
               src={themeIcon}
               alt="Color mode icon"
               onClick={toggleTheme}
            />
         </div>
         <div className={styles.info}>
            <h1>
               Berk
               <br />
               Limoncu
            </h1>
            <h2> Full-Stack & Mobile Developer</h2>

            <span>
               <a href="https://github.com/belimm/" target="_blank">
                  <img src={githubIcon} alt="Github icon" />
               </a>
               <a
                  href="https://www.linkedin.com/in/berklimoncu/"
                  target="_blank">
                  <img src={linkedinIcon} alt="Linkedin icon" />
               </a>
            </span>
            <p className={styles.description}>
               From building secure fintech solutions to crafting innovative
               mobile apps, I thrive at the intersection of scalability,
               security, and seamless digital experiences.
            </p>
            <a href={CV} download="Berk_Limoncu_CV.pdf">
               <button className="hover">Resume</button>
            </a>
         </div>
      </section>
   );
}

export default Hero;
