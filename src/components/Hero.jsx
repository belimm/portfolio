import React from 'react'
import {Link} from 'react-scroll'

import belimage from '../assets/img/limon.webp';
import { LazyLoadImage } from "react-lazy-load-image-component";

import 'react-lazy-load-image-component/src/effects/blur.css';
import ReactTypingEffect from 'react-typing-effect';


function Hero() {

 

  return (
    <section
      id='home'
      className='lg:h-[85vh] flex items-center bg-primary lg:bg-cover lg:bg-center lg:bg-no-repeat py-32 lg:py-0 overflow-hidden'
    >
      <div className='container mx-auto h-full'>
        <div className='flex items-center h-full pt-8'>
          <div className='flex-1 flex flex-col items-center lg:items-start'>

          <ReactTypingEffect
            text={["Hey there, I'm Berk"]}
            cursorRenderer={cursor => <h1>{cursor}</h1>}
            displayTextRenderer={(text, i) => {
              return (
                <p className='text-lg text-accent text-md mb-[22px]'>
                  {text.split('').map((char, i) => {
                    const key = `${i}`;
                    return (
                      <span
                        key={key}
                        
                      >{char}</span>
                    );
                  })}
                </p>
              );
            }}        
          />
          
            <h1 className='text-4xl leading-[44px] md:text-5xl md:leading-tight lg:text-7xl lg:leading-[1.2] font-bold md:tracking-[-2px]'>
              React & Flutter Developer <br/> 
            </h1>
            <br/><br/>
            
            <div class="h-10 grid grid-cols-2 gap-8 content-start">
              <Link 
                    to="contact"
                    activeClass="active"
                    spy={true}
                    smooth={true}
                    duration={500}
                    offset={-170}
                    className="transition-all duration-300"
                  >
                  <button className='btn btn-md bg-accent hover:bg-secondary-hover md:btn-lg transition-all rounded-lg text-sm'>
                    Work with me
                  </button>
                    
              </Link>
              
              <a href='https://drive.google.com/drive/folders/1n5C1DKR8c-PysiV_UH4U_jnEIwcVdavv?usp=sharing' target='_blank'>
                <button className='btn btn-md bg-accent hover:bg-secondary-hover md:btn-lg transition-all rounded-lg text-sm'>
                  Get CV
                </button>

              </a>

              

            </div>
              
            
          </div>
          <div className='hidden lg:flex flex-1 justify-end items-center h-full'>

          <LazyLoadImage 
                src={belimage}
                effect="blur"
                style={{borderRadius:"80%"}}
                >
                
          </LazyLoadImage>
          
          </div>
        </div>
      </div>
    </section>
  );


 
}

export default Hero