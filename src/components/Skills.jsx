import React from 'react'
import { skills } from '../data';
import {
  
  FiMail,
  FiMapPin,
  
  
} from 'react-icons/fi';
function Skills() {
  
  return (
    <section className='bg-tertiary py-12'>
      <div className='container mx-auto'>
        <div
          className='grid grid-cols-16 md:grid-flow-col'
        >
          
          {skills.map((skill, index) => {
            

            return (
              
                <div
                  className='flex items-center justify-center items-center text-center'
                  key={index}
                >
                  
                  <div class="h-50 grid grid-cols- gap-5 content-center">
                    
                    {skill.icon}
                    {skill.label}
                    
                  </div>
                  
                  
                  
                </div>
              
            );
          })}
          
        </div>
      </div>
    </section>
  );

    return (
        <section className='bg-tertiary py-12'>
          <div className='container mx-auto'>
            <div
              className='grid grid-cols-8 md:grid-flow-col'
            >
              {skills.map((skill, index) => {
                return (
                  <div
                    className='flex items-center justify-center'
                    key={index}
                  >
                    <img className='lg:h-20' src={skill.image} alt='' />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      );
}

export default Skills