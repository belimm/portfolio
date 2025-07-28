'use client';

import { useState } from 'react';
import Title from './title/Title';
import Projects from './projects/Projects';
import Skills from './skills/Skills';
import Contact from './contact/Contanct';
import SocialIcons from '../components/SocialIcons/SocialIcons';

export default function Home() {
   const [isSocialIconsBlinking, setIsSocialIconsBlinking] = useState(false);

   const handleContactClick = () => {
      setIsSocialIconsBlinking(true);

      // Stop blinking after 3 seconds
      setTimeout(() => {
         setIsSocialIconsBlinking(false);
      }, 3000);
   };

   return (
      <div
         style={{
            margin: '5%',
            flexDirection: 'column',
            gap: '2rem',
            position: 'relative',
         }}>
         <SocialIcons isBlinking={isSocialIconsBlinking} />
         <Title onContactClick={handleContactClick} />
         <Projects />
         <Skills />
         <Contact />
      </div>
   );
}
