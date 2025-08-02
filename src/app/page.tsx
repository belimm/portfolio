'use client';

import { useState } from 'react';
import Title from './title/Title';
import Projects from './projects/Projects';
import Skills from './skills/Skills';
import Contact from './contact/Contact';
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
            width: '100vw',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            position: 'relative',
            padding: 0,
            margin: 0,
         }}>
         <SocialIcons isBlinking={isSocialIconsBlinking} />
         {/* <SectionNav />*/}
         <Title onContactClick={handleContactClick} />
         <Projects />
         <Skills />
         <Contact />
      </div>
   );
}
