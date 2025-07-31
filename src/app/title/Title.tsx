'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import DeveloperTerminal from '../../components/DeveloperTerminal/DeveloperTerminal';
import CustomButton from '../../components/CustomButton/CustomButton';
import TechnologyIcons from '../../components/TechnologyIcons/TechnologyIcons';
import MessageModal from '../../components/MessageModal/MessageModal';

import styles from './ProjectsStyles.module.css';
import Avatar from '@/components/Avatar/Avatar';

interface TitleProps {
   onContactClick?: () => void;
}

export default function Title({ onContactClick }: TitleProps) {
   // 1. Manage terminal state here
   const [terminalEntries, setTerminalEntries] = useState([
      { command: 'whoami', output: 'Berk Limoncu - Full Stack Developer' },
   ]);
   //const [showTechnologies, setShowTechnologies] = useState(false);
   const [isModalOpen, setIsModalOpen] = useState(false);

   useEffect(() => {
      console.log(13);
   });

   // 2. Update terminal state on button click
   // const handleGetCVButtonClick = () => {
   //    console.log(process.env); // Will NOT show your secrets      // Add terminal entries
   //    setTerminalEntries((prev) => [
   //       ...prev,
   //       {
   //          command: 'curl -O https://berk.dev/cv.pdf',
   //          output: 'Downloading...',
   //       },
   //    ]);

   //    // Actually download the CV file from Google Drive
   //    const link = document.createElement('a');
   //    link.href =
   //       'https://drive.google.com/uc?export=download&id=1JtAdsEvPX0x-Ec_QyNcTAwne678c5s5k';
   //    link.download = 'Berk_Limoncu_CV.pdf';
   //    document.body.appendChild(link);
   //    link.click();
   //    document.body.removeChild(link);

   //    // Show success message when user interacts with the page (assumes download completed)
   //    const handleUserInteraction = () => {
   //       setTerminalEntries((prev) => [
   //          ...prev.slice(0, -1), // Remove the last entry
   //          {
   //             command: 'curl -O https://berk.dev/cv.pdf',
   //             output: 'CV downloaded successfully!',
   //          },
   //       ]);
   //       // Remove the event listeners
   //       document.removeEventListener('click', handleUserInteraction);
   //       document.removeEventListener('keydown', handleUserInteraction);
   //    };

   //    // Add event listeners for user interaction
   //    document.addEventListener('click', handleUserInteraction);
   //    document.addEventListener('keydown', handleUserInteraction);
   // };

   const handleGetCVButtonClick = () => {
      setTerminalEntries((prev) => [
         ...prev,
         {
            command: 'curl -O https://berk.dev/cv.pdf',
            output: 'Opened CV in new tab...',
         },
      ]);

      // Open the CV in a new tab
      window.open(
         'https://drive.google.com/file/d/1JtAdsEvPX0x-Ec_QyNcTAwne678c5s5k/view?usp=sharing',
         '_blank'
      );
   };

   // 2. Update terminal state on button click
   const handleContactButtonClick = () => {
      // setTerminalEntries((prev) => [
      //    ...prev,
      //    {
      //       command: 'cat contact.txt',
      //       output:
      //          'Email: berk@example.com\nLinkedIn: linkedin.com/in/berklimoncu\nLocation: Berlin, Germany\nGitHub: github.com/belimm',
      //    },
      // ]);

      setIsModalOpen(true); // <-- open modal here
      onContactClick?.();
   };

   return (
      <div className={styles.container}>
         <div className={styles.profileSection}>
            <Avatar />

            <div className={`${styles.name} ${styles.fadeInUp}`}>
               Berk Limoncu
            </div>
            <div className={`${styles.pronunciation} ${styles.fadeInUp}`}>
               {' '}
               /beɾk//
            </div>
            <div className={`${styles.role} ${styles.fadeInUp}`}>
               Full Stack Developer
            </div>
            <div className={`${styles.location} ${styles.fadeInUp}`}>
               📍Berlin, Germany
            </div>
         </div>

         {/* Technologies section on the right */}
         {/* <div className={styles.technologiesSection}>
            <TechnologyIcons isVisible={showTechnologies} />
         </div> */}

         {/* 3. Render DeveloperTerminal and pass entries */}
         <DeveloperTerminal
            entries={terminalEntries}
            autoType={true}
            typingSpeed={20} // Very fast typing
         />

         {/* 4. Button triggers terminal update */}
         <div className={styles.outerButtonContainer}>
            <div className={styles.buttonContainer}>
               <CustomButton onClick={handleGetCVButtonClick}>
                  Open CV
               </CustomButton>
               <CustomButton onClick={handleContactButtonClick}>
                  {`Let's Talk`}
               </CustomButton>
            </div>
            {/*<CustomButton>Book a Meeting</CustomButton> */}
         </div>
         {isModalOpen && <MessageModal onClose={() => setIsModalOpen(false)} />}
      </div>
   );
}
