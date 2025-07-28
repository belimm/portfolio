'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './TypeWriter.module.css';

interface TypeWriterProps {
   text: string;
   speed?: number; // Base speed in ms per character
   onComplete?: () => void;
   className?: string;
   showCursor?: boolean;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
   text,
   speed = 30, // Fast base speed
   onComplete,
   className = '',
   showCursor = true,
}) => {
   const [displayedText, setDisplayedText] = useState('');
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isTyping, setIsTyping] = useState(false);
   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

   // Human-like typing patterns
   const getTypingDelay = (char: string, index: number): number => {
      // Base delay with some randomness
      let delay = speed + Math.random() * 20 - 10; // ±10ms variation

      // Faster typing for common characters
      if (char === ' ' || char === '.' || char === ',' || char === '!') {
         delay *= 0.7; // 30% faster
      }

      // Slower for special characters
      if (char === '@' || char === '#' || char === '$' || char === '%') {
         delay *= 1.5; // 50% slower
      }

      // Natural pauses at sentence endings
      if (char === '.' || char === '!' || char === '?') {
         delay += 150 + Math.random() * 200; // 150-350ms pause
      }

      // Pause at commas
      if (char === ',') {
         delay += 50 + Math.random() * 100; // 50-150ms pause
      }

      // Occasional longer pauses (simulating thinking)
      if (Math.random() < 0.02) {
         // 2% chance
         delay += 200 + Math.random() * 300; // 200-500ms pause
      }

      return Math.max(delay, 10); // Minimum 10ms delay
   };

   // Simulate occasional typos and corrections
   const simulateTypo = (
      char: string
   ): { char: string; shouldCorrect: boolean } => {
      if (Math.random() < 0.003) {
         // 0.3% chance of typo
         const commonTypos: { [key: string]: string } = {
            a: 's',
            s: 'a',
            e: 'r',
            r: 'e',
            i: 'o',
            o: 'i',
            n: 'm',
            m: 'n',
            t: 'y',
            y: 't',
         };
         return { char: commonTypos[char] || char, shouldCorrect: true };
      }
      return { char, shouldCorrect: false };
   };

   useEffect(() => {
      if (currentIndex >= text.length) {
         setIsTyping(false);
         onComplete?.();
         return;
      }

      setIsTyping(true);
      const char = text[currentIndex];
      const delay = getTypingDelay(char, currentIndex);

      timeoutRef.current = setTimeout(() => {
         // Simulate typo occasionally
         const typoResult = simulateTypo(char);
         setDisplayedText((prev) => prev + typoResult.char);

         // If there's a typo, correct it after a short delay
         if (typoResult.shouldCorrect) {
            setTimeout(() => {
               setDisplayedText((prev) => prev.slice(0, -1) + char);
            }, 200 + Math.random() * 300); // 200-500ms delay before correction
         }

         setCurrentIndex((prev) => prev + 1);
      }, delay);

      return () => {
         if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
         }
      };
   }, [currentIndex, text, speed, onComplete]);

   // Reset when text changes
   useEffect(() => {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(false);
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }
   }, [text]);

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

export default TypeWriter;
