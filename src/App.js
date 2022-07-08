import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackTop from './components/BackTop';
import { ToastContainer, toast } from 'react-toastify';
// import components

const App = () => {
  return (
    <>
     
      <Header/>
      <Hero></Hero>
      <About></About>
      <Skills></Skills>
      <Portfolio />
      <Contact/>
      <Footer/>
      <BackTop />
      

      
    </>
  );
};

export default App;
