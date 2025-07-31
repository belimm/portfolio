'use client';

import React, { useState, useRef } from 'react';
import styles from './MessageModal.module.css';
import emailjs from 'emailjs-com';
import { toast } from 'react-hot-toast';

interface MessageModalProps {
   onClose: () => void;
}

export default function MessageModal({ onClose }: MessageModalProps) {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [message, setMessage] = useState('');
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState({
      name: false,
      email: false,
      message: false,
   });

   const modalRef = useRef<HTMLDivElement>(null);

   const validateEmail = (email: string) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

   const NEXT_PUBLIC_EMAILJS_SERVICE_ID = 'service_wr75o0t';
   const NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'template_fme7avk';
   const NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = 'vQxRA0FBApM6uubPh';

   const handleSend = async () => {
      const hasErrors = {
         name: name.trim() === '',
         email: !validateEmail(email),
         message: message.trim() === '',
      };
      setErrors(hasErrors);
      if (hasErrors.name || hasErrors.email || hasErrors.message) return;

      setLoading(true);

      try {
         await emailjs.send(
            'service_wr75o0t',
            'template_fme7avk',
            {
               name,
               email,
               message,
               time: new Date().toLocaleString(), // optional
            },
            'vQxRA0FBApM6uubPh'
         );

         toast.success('Message sent successfully!');
         setTimeout(() => onClose(), 700); // Wait before closing modal
      } catch (error) {
         console.error('Failed to send message:', error);
         toast.error('Failed to send message. Please try again later.');
      } finally {
         setLoading(false);
      }
   };

   const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
         onClose();
      }
   };

   return (
      <div className={styles.overlay} onClick={handleClickOutside}>
         <div ref={modalRef} className={styles.modal}>
            <button className={styles.closeButton} onClick={onClose}>
               ×
            </button>
            <h2>Send a Message</h2>
            <input
               type="text"
               placeholder="Your Name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className={`${styles.input} ${
                  errors.name ? styles.inputError : ''
               }`}
            />
            <input
               type="email"
               placeholder="Your Email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className={`${styles.input} ${
                  errors.email ? styles.inputError : ''
               }`}
            />
            <textarea
               placeholder="Your Message"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               className={`${styles.textarea} ${
                  errors.message ? styles.inputError : ''
               }`}
            />
            <button
               className={styles.sendButton}
               onClick={handleSend}
               disabled={loading}>
               {loading ? 'Sending...' : 'Send'}
            </button>
         </div>
      </div>
   );
}
