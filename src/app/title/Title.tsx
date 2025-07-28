'use client';

import React, { useState } from 'react';
import DeveloperTerminal from '../../components/DeveloperTerminal/DeveloperTerminal';
import CustomButton from '../../components/CustomButton/CustomButton';
import Image from 'next/image';
import avatar from '../../assets/berk_avatar.jpg';
import styles from './ProjectsStyles.module.css';

export default function Title() {
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
            output:
               '  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current\n                                 Dload  Upload   Total   Spent    Left  Speed\n100  245k  100  245k    0     0   245k      0  0:00:01  0:00:01 --:--:--  245k\nCV downloaded successfully!',
         },
         {
            command: 'ls -lh cv.pdf',
            output: '-rw-r--r--  1 berk  staff   245K Dec 15 10:30 cv.pdf',
         },
         {
            command: 'open cv.pdf',
            output: 'Opening CV in default application...',
         },
      ]);

      // Actually download the CV file from Google Drive
      const link = document.createElement('a');
      // Replace this with your actual Google Drive link
      // Format: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID
      link.href =
         'https://drive.google.com/uc?export=download&id=1JtAdsEvPX0x-Ec_QyNcTAwne678c5s5k';
      link.download = 'Berk_Limoncu_CV.pdf';
      link.target = '_blank'; // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
