import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import Logo from '../assets/img/logo.svg'
import Navbar from './Navbar'
import NavbarMobile from './NavbarMobile'
import Socials from './Socials'

function Header() {
    const [bg,setBg] = useState(false);

    useEffect(()=>{
        window.addEventListener(
            'scroll',
            ()=>{
                return window.scrollY>50? setBg( true): setBg(false) ;
            }
        )
    }) 

  return (
    <header className={`${bg? 'bg-tertiary h-20' :'h-24'} flex items-center fixed top-0 w-full text-white z-10 transition-all duration 300`} >
        <div className="container mx-auto h-full flex items-center justify-between">
            <a href='#'>
                <p style={{fontSize:40,fontWeight:"Bold"}}>Berk Limoncu</p>
            </a>
            <div className="hidden lg:block">
                <Navbar></Navbar>
            </div>
            <div className="hidden lg:block">
                <Socials></Socials>
            </div>
            <div className="lg:hidden">
                <NavbarMobile></NavbarMobile>
            </div>
        </div>
    </header>
  )
}

export default Header