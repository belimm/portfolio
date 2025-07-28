import React, { useEffect, useRef, useState } from 'react';
import styles from './DeveloperTerminal.module.css';
import TypeWriter from '../TypeWriter/TypeWriter';

type TerminalEntry = {
   command: string;
   output?: string;
   isTyping?: boolean;
};

interface DeveloperTerminalProps {
   entries: TerminalEntry[];
   autoType?: boolean;
   typingSpeed?: number;
}

const DeveloperTerminal: React.FC<DeveloperTerminalProps> = ({
   entries,
   autoType = true,
   typingSpeed = 25,
}) => {
   const scrollRef = useRef<HTMLDivElement>(null);
   const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

   // Handler to detect if user is scrolled up
   const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setIsUserScrolledUp(scrollTop + clientHeight < scrollHeight - 5);
   };

   useEffect(() => {
      if (!scrollRef.current) return;
      if (!isUserScrolledUp) {
         scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
   }, [entries, isUserScrolledUp]);

   return (
      <div className={styles.terminalContainer}>
         <div
            className={styles.terminalScroll}
            ref={scrollRef}
            onScroll={handleScroll}>
            {entries.map((entry, idx) => (
               <div key={idx} className={styles.terminalEntry}>
                  <span className={styles.prompt}>$</span>
                  {entry.command}
                  {entry.output && (
                     <div className={styles.output}>
                        {entry.output}
                     </div>
                  )}
               </div>
            ))}
            {/* Blinking cursor on a new line with prompt */}
            <div className={styles.terminalEntry}>
               <span className={styles.prompt}>$</span>
               <span className={styles.cursor} />
            </div>
         </div>
      </div>
   );
};

export default DeveloperTerminal;
