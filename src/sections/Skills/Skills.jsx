import styles from './SkillsStyles.module.css';
import checkMarkIconDark from '../../assets/checkmark-dark.svg';
import checkMarkIconLight from '../../assets/checkmark-light.svg';
import SkillList from '../../common/SkillList';
import { useTheme } from '../../common/ThemeContext';

function Skills() {
  const { theme } = useTheme();
  const checkMarkIcon = theme === 'light' ? checkMarkIconLight : checkMarkIconDark;

  return (
     <section id="skills" className={styles.container}>
        <h1 className="sectionTitle">Skills</h1>
        <div className={styles.skillList}>
           <SkillList src={checkMarkIcon} skill="React" />
           <SkillList src={checkMarkIcon} skill="HTML" />
           <SkillList src={checkMarkIcon} skill="CSS" />
           <SkillList src={checkMarkIcon} skill="JavaScript" />
           <SkillList src={checkMarkIcon} skill="TypeScript" />
           <SkillList src={checkMarkIcon} skill="Node" />
        </div>
        <hr />
        <div className={styles.skillList}>
           <SkillList src={checkMarkIcon} skill="Java" />
           <SkillList src={checkMarkIcon} skill="Spring Boot" />
           <SkillList src={checkMarkIcon} skill="MongoDB" />
           <SkillList src={checkMarkIcon} skill="Oracle SQL" />
        </div>
        <hr />
        <div className={styles.skillList}>
           <SkillList src={checkMarkIcon} skill="React Native" />
           <SkillList src={checkMarkIcon} skill="Expo" />
        </div>
        <hr />
        <div className={styles.skillList}>
           <SkillList src={checkMarkIcon} skill="Git" />
           <SkillList src={checkMarkIcon} skill="Docker" />
        </div>
     </section>
  );
}

export default Skills;
