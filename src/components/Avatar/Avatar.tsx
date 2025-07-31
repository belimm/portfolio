import Image from 'next/image';
import styles from './Avatar.module.css';
import { useEffect, useState } from 'react';
import avatar from '../../assets/berk_avatar.jpg';

export default function Avatar() {
   const [animate, setAnimate] = useState(false);

   useEffect(() => {
      // Trigger the animation on first render
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000); // match animation duration
      return () => clearTimeout(timer);
   }, []);

   return (
      <div
         className={`${styles.avatarWrapper} ${
            animate ? styles.coinFlip : ''
         }`}>
         <Image
            src={avatar}
            alt="Avatar"
            className={styles.avatarImg}
            width={140}
            height={140}
            priority
         />
      </div>
   );
}
