import React from 'react'
import {Link} from 'react-scroll'

import WomanImg from '../assets/img/limon.webp';


function Hero() {

  const downloadCV = ()=>{
    console.log("İndi");
  }

  return (
    <section
      id='home'
      className='lg:h-[85vh] flex items-center bg-primary lg:bg-cover lg:bg-center lg:bg-no-repeat py-32 lg:py-0 overflow-hidden'
    >
      <div className='container mx-auto h-full'>
        <div className='flex items-center h-full pt-8'>
          <div className='flex-1 flex flex-col items-center lg:items-start'>
            <p className='text-lg text-accent text-md mb-[22px]'>
              Hey, I'm Berk! 
            </p>
            <h1 className='text-4xl leading-[44px] md:text-5xl md:leading-tight lg:text-7xl lg:leading-[1.2] font-bold md:tracking-[-2px]'>
              React & Flutter Developer <br/> 
            </h1>
            <br/><br/>
            {/* <p className='pt-4 pb-8 md:pt-6 md:pb-12 max-w-[480px] text-lg text-center lg:text-left'>
              Lorem ipsum dolor sit amet consectetur adipisicing illo ad labore
              dolor elit.
            </p> */}
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
                  <button className='btn btn-md bg-accent hover:bg-secondary-hover md:btn-lg transition-all rounded-lg'>
                    Work with me
                  </button>
                    
              </Link>

              <button onClick={downloadCV} className='btn btn-md bg-accent hover:bg-secondary-hover md:btn-lg transition-all rounded-lg'>
                Download CV      
              </button>

            </div>
             
            
          </div>
          <div className='hidden lg:flex flex-1 justify-end items-center h-full'>
          <img style={{borderRadius:"80%"}}src={WomanImg} alt='' />
          </div>
        </div>
      </div>
    </section>
  );


  return (
    <section className='lg:h-[85vh] flex items-center bg-primary lg:bg-cover lg:bg-center lg:bg-no-repeat py-32 lg:py-0 overflow-hidden'>
        <div className="container mx-auto">Hero</div>
    </section>
  )
}

export default Hero