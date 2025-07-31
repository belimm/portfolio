'use client';
import React from 'react';
import styles from './CustomButton.module.css';

type CustomButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
   children: React.ReactNode;
};

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...props }) => (
   <button {...props} className={styles.customBtn}>
      {children}
   </button>
);

export default CustomButton;
