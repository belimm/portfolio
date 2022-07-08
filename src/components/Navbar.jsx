 import React from 'react'
 
 import {navigation} from "../data"
 import {Link} from 'react-scroll'

 function Navbar() {
   return (
     <nav>
        <ul className='flex space-x-8 capitalize text-[15px]'>
          {navigation.map((item,i)=>{
             return(
              <li className='text-white text-xl hover:text-accent cursor-pointer' key={i}>
                <Link 
                  to={item.href}
                  activeClass="active"
                  spy={true}
                  smooth={true}
                  duration={500}
                  offset={-170}
                  className="transition-all duration-300"
                >
                
                  {item.name}
                </Link>
              </li>
             )
          })}
        </ul>
     </nav>
   )
 }
 
 export default Navbar