'use client';

import React, { useState } from 'react';
import DeveloperTerminal from '../../components/DeveloperTerminal/DeveloperTerminal';
import CustomButton from '../../components/CustomButton/CustomButton';
import Image from 'next/image';
import avatar from '../../assets/berk_avatar.jpg';
import styles from './ProjectsStyles.module.css';

interface TitleProps {
   onContactClick?: () => void;
}

export default function Title({ onContactClick }: TitleProps) {
   // 1. Manage terminal state here
   const [terminalEntries, setTerminalEntries] = useState([
      { command: 'whoami', output: 'Berk Limoncu - Full Stack Developer' },
   ]);

   // 2. Update terminal state on button click
   const handleGetCVButtonClick = () => {
      // Add terminal entries
      setTerminalEntries((prev) => [
         ...prev,
         {
            command: 'curl -O https://berk.dev/cv.pdf',
            output: 'Downloading...',
         },
      ]);

      // Actually download the CV file from Google Drive
      const link = document.createElement('a');
      link.href =
         'https://drive.google.com/uc?export=download&id=1JtAdsEvPX0x-Ec_QyNcTAwne678c5s5k';
      link.download = 'Berk_Limoncu_CV.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message when user interacts with the page (assumes download completed)
      const handleUserInteraction = () => {
         setTerminalEntries((prev) => [
            ...prev.slice(0, -1), // Remove the last entry
            {
               command: 'curl -O https://berk.dev/cv.pdf',
               output: 'CV downloaded successfully!',
            },
         ]);
         // Remove the event listeners
         document.removeEventListener('click', handleUserInteraction);
         document.removeEventListener('keydown', handleUserInteraction);
      };

      // Add event listeners for user interaction
      document.addEventListener('click', handleUserInteraction);
      document.addEventListener('keydown', handleUserInteraction);
   };

   // 2. Update terminal state on button click
   const handleContactButtonClick = () => {
      setTerminalEntries((prev) => [
         ...prev,
         {
            command: 'cat contact.txt',
            output:
               'Email: berk@example.com\nLinkedIn: linkedin.com/in/berklimoncu\nLocation: Berlin, Germany\nGitHub: github.com/belimm',
         },
      ]);

      // Trigger blinking effect for social icons
      onContactClick?.();
   };

   return (
      <div className={styles.container}>
         <Image
            src={avatar}
            alt="Berk Avatar"
            className={styles.avatar}
            width={140}
            height={140}
         />
         <div className={styles.name}>Berk Limoncu</div>
         <div className={styles.pronunciation}> /beɾk//</div>
         <div className={styles.role}>Full Stack Developer</div>
         <div className={styles.skills}>
            React Native / Next.js &bull; Docker &bull;
         </div>
         <div className={styles.location}>📍Berlin, Germany</div>

         {/* 3. Render DeveloperTerminal and pass entries */}
         <DeveloperTerminal
            entries={terminalEntries}
            autoType={true}
            typingSpeed={20} // Very fast typing
         />

         {/* 4. Button triggers terminal update */}
         <div className={styles.buttonContainer}>
            <CustomButton onClick={handleGetCVButtonClick}>Get CV</CustomButton>
            <CustomButton onClick={handleContactButtonClick}>
               Contact
            </CustomButton>
         </div>
      </div>
   );
}
