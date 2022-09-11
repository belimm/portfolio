import React, { useState } from 'react';

// import icons
import { XIcon } from '@heroicons/react/outline';
import { MenuAlt3Icon } from '@heroicons/react/outline';

// import navigation data
import { navigation } from '../data';

// import components

import {socialMobile} from '../data'

// import framer
import { motion } from 'framer-motion';

// import Link
import { Link } from 'react-scroll';
import { keyboardImplementationWrapper } from '@testing-library/user-event/dist/keyboard';


function NavbarMobile() {
  const [isOpen, setIsOpen] = useState(false);


  const circleVariants = {
    hidden: {
      scale: 0,
    },
    visible: {
      scale: 180,
      transition: {
        type: 'spring',
        stiffness: 160,
        damping: 60,
      },
    },
  };

  const ulVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
      },
    },
  };

  return (
    <nav className='relative'>
      <div
        onClick={() => setIsOpen(true)}
        className='cursor-pointer text-white'
      >
        <MenuAlt3Icon className='w-8 h-8' />
      </div>

      {/* circle */}
      <motion.div
        variants={circleVariants}
        initial='hidden'
        animate={isOpen ? 'visible' : 'hidden'}
        className='w-4 h-4 rounded-full bg-accent fixed top-0 right-0'
      ></motion.div>

      <motion.ul
        variants={ulVariants}
        initial='hidden'
        animate={isOpen ? 'visible' : ''}
        className={`${
          isOpen ? 'right-0' : '-right-full'
        } fixed top-0 bottom-0 w-full flex flex-col justify-center items-center transition-all duration-300 overflow-hidden`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className='cursor-pointer absolute top-8 right-8'
        >
          <XIcon className='w-8 h-8' />
        </div>
        
        {navigation.map((item, idx) => {
          
          return (
            <div>
              <li key={idx} className='mb-8'>
                <Link
                  to={item.href}
                  smooth={true}
                  duration={500}
                  offset={-70}
                  className='text-xl cursor-pointer capitalize'
                >
                  <button onClick={()=>{setIsOpen(false);}}>
                    {item.name}
                  </button>
                  
                </Link>
              </li>
            </div>
              
            
            
          );

          
        })}

        <br></br>
        <br></br>
        <br></br>

        {socialMobile.map((item, index) => {
          return (
            <div className='mb-8'>
                <li
              className='flex justify-center items-center text-accent'
              key={index}
            >
              <a className='text-base' href={item.href} target="_blank">
                {item.icon}
              </a>
            </li>
            </div>
            
          );
        })}

        
        <a href='https://github.com/berklimoncu'>
          
        </a>
      </motion.ul>
    </nav>
  );
}

export default NavbarMobile