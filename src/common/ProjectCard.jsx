import React, { useState } from 'react';

import { useTheme } from './ThemeContext';
import styles from './ProjectCardStyles.module.css';

function Modal({ children, onClose }) {
   const { theme } = useTheme();

   // Inline styles for the modal overlay and container
   const overlayStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
   };

   const modalStyle = {
      background: theme === 'light' ? '#fff' : '#333',
      padding: '20px 20px 30px 20px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      resize: 'both',
      overflow: 'auto',
      maxWidth: '60%',
      maxHeight: '90%',
   };

   const buttonStyle = {
      borderRadius: '8px',
      color: theme === 'light' ? '#222' : '#000',
      border: `1px solid ${theme === 'light' ? '#222' : '#FFF'}`,
      float: 'right',
   };

   return (
      <div style={overlayStyle} onClick={onClose}>
         <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <button onClick={onClose} style={buttonStyle}>
               X
            </button>
            {children}
         </div>
      </div>
   );
}

function ProjectCard({ src, link, h3, p, paragraph, url }) {
   const { theme } = useTheme();
   const [showModal, setShowModal] = useState(false);
   const getDetailsButtonStyle = {
      color: theme === 'light' ? '#000' : '#fff',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontWeight: 'bold',
      margin: '20px 0px 0px 20px',
   };
   // If a link is provided, the card is a clickable link.
   if (link) {
      return (
         <a href={link} target="_blank" rel="noopener noreferrer" className="">
            <img className={styles.projectImage} src={src} alt={`${h3} logo`} />
            <h3 className={styles.projectTitle}>{h3}</h3>
            <p className={styles.projectDefinition}>{p}</p>
         </a>
      );
   }

   // If no link is provided, we show the card that opens a modal on click.
   return (
      <>
         <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <img className={styles.projectImage} src={src} alt={`${h3} logo`} />
            <h3 className={styles.projectTitle}>{h3}</h3>
            <p className={styles.projectDefinition}>{p}</p>
         </div>
         {showModal && (
            <Modal onClose={() => setShowModal(false)}>
               <h3>{h3}</h3>
               <p>{p}</p>
               <br />
               {<p>{paragraph}</p>}
               {url && (
                  <a
                     style={getDetailsButtonStyle}
                     href={url}
                     target="_blank"
                     className={styles.fadeAnimation}>
                     <p style={getDetailsButtonStyle}>Get Details</p>
                  </a>
               )}
            </Modal>
         )}
      </>
   );
}

export default ProjectCard;
