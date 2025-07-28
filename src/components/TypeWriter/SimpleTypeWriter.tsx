'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './TypeWriter.module.css';

interface SimpleTypeWriterProps {
   text: string;
   speed?: number;
   className?: string;
   showCursor?: boolean;
   onComplete?: () => void;
   autoStart?: boolean;
}

const SimpleTypeWriter: React.FC<SimpleTypeWriterProps> = ({
   text,
   speed = 30,
   className = '',
   showCursor = true,
   onComplete,
   autoStart = true,
}) => {
   const [displayedText, setDisplayedText] = useState('');
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isTyping, setIsTyping] = useState(false);
   const [isStarted, setIsStarted] = useState(autoStart);
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

   const startTyping = () => {
      setIsStarted(true);
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(false);
   };

   const stopTyping = () => {
      setIsStarted(false);
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }
   };

   const resetTyping = () => {
      stopTyping();
      setTimeout(startTyping, 100);
   };

   // Human-like typing patterns
   const getTypingDelay = (char: string): number => {
      let delay = speed + Math.random() * 15 - 7; // ±7ms variation

      // Faster for common characters
      if (char === ' ' || char === '.' || char === ',') {
         delay *= 0.8;
      }

      // Slower for special characters
      if (char === '@' || char === '#' || char === '$') {
         delay *= 1.3;
      }

      // Natural pauses
      if (char === '.' || char === '!' || char === '?') {
         delay += 100 + Math.random() * 150;
      }

      if (char === ',') {
         delay += 30 + Math.random() * 70;
      }

      return Math.max(delay, 8);
   };

   useEffect(() => {
      if (!isStarted || currentIndex >= text.length) {
         setIsTyping(false);
         if (currentIndex >= text.length) {
            onComplete?.();
         }
         return;
      }

      setIsTyping(true);
      const char = text[currentIndex];
      const delay = getTypingDelay(char);

      timeoutRef.current = setTimeout(() => {
         setDisplayedText((prev) => prev + char);
         setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, [currentIndex, text, speed, onComplete, isStarted]);

   // Reset when text changes
   useEffect(() => {
      if (autoStart) {
         resetTyping();
      }
   }, [text, autoStart]);

   // Cleanup on unmount
   useEffect(() => {
      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, []);

   return (
      <span className={`${styles.typewriter} ${className}`}>
         {displayedText}
         {showCursor && isTyping && <span className={styles.cursor} />}
      </span>
   );
};

export default SimpleTypeWriter;
