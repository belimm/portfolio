import Title from './title/Title';
import Projects from './projects/Projects';
import Skills from './skills/Skills';
import Contact from './contact/Contanct';
import SocialIcons from '../components/SocialIcons/SocialIcons';

export default function Home() {
   return (
      <div
         style={{
            margin: '5%',
            flexDirection: 'column',
            gap: '2rem',
            position: 'relative',
         }}>
         <SocialIcons />
         <Title />
         <Projects />
         <Skills />
         <Contact />
      </div>
   );
}
