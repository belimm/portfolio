import React from 'react'

import Image from '../assets/img/berkobaba.webp';
import {Link} from 'react-scroll'

function About() {
    return (
        <section className='section bg-secondary' id='about'>
          <div className='container mx-auto'>
            <div className='flex flex-col xl:flex-row gap-24'>
              <img
                className='object-cover h-full w-[566px] md:mx-auto lg:mx-0 rounded-2xl'
                src={Image}
                alt=''
              />
              <div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
                <div className='flex flex-col'>
                  <h2 className='text-3xl lg:text-4xl font-medium lg:font-extrabold mb-3 before:content-about relative before:absolute before:opacity-40 before:-top-[2rem] before:hidden before:lg:block'>
                    Berk Limoncu
                  </h2>
                  <p className='mb-4 text-accent'>
                    Frontend Web Developer <br/> Cross Platform Mobile Application Developer
                  </p>
                  <hr className='mb-8 opacity-5' />
                  <p className='mb-8'>
                  Every problem has a solution till you find a new problem

                    <br />
                    
                  </p>
                </div>

                <Link 
                  to="contact"
                  activeClass="active"
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-170}
                  className="transition-all duration-300"
                >
                  <button className='btn btn-md bg-accent hover:bg-secondary-hover transition-all rounded-lg'>
                    Contact me
                  </button>
                  
                </Link>
                
              </div>
            </div>
          </div>
        </section>
      );
}

export default About