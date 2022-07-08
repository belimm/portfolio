import React from 'react'

import{
  FaGithub,
  FaGoogleDrive
} from 'react-icons/fa'

function Project({ item }) {
    return (
        <div key={item.id} class='flex flex-col items-center text-center'>
          <div className='mb-8'>
            <img className='rounded-2xl' src={item.image} alt='' />
            
          </div>
          <p className='capitalize text-accent text-sm mb-3'>{item.category}</p>
          <h3 className='text-2xl font-semibold capitalize mb-3'>{item.name}</h3>
          
          <div class="h-10 grid grid-cols-2 gap-4 content-start">
            <a href={item.githublink} target="_blank">
              <FaGithub size={"24"}></FaGithub>
            </a>
            {item.drivelink && 
               <a href={item.drivelink} target="_blank">
                <FaGoogleDrive size={"24"}></FaGoogleDrive>
               </a>
            
            }
           


          </div>
         
         
          
          <div className="mb-8"/>
          
          <p className='text-base max-w-md'>
            {item.explanation}
          </p>
         
        </div>
      );
}

export default Project