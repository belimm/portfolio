//  icons
import {
  
  FiMail,
  FiMapPin,
  
  
} from 'react-icons/fi';

import{
  FaMedium,
  FaGithub,
  FaLinkedin,
  FaTwitterSquare

} from 'react-icons/fa'

import{
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiReact,
  SiGit,
  SiFlutter

} from 'react-icons/si'



// projects images
import Project1 from './assets/img/projects/Project1.webp';
import Project2 from './assets/img/projects/Project2.webp';
import Project3 from './assets/img/projects/Project3.webp';
import Project4 from './assets/img/projects/Project4.webp';
import Project5 from './assets/img/projects/Project5.webp';
import Project6 from './assets/img/projects/Project6.webp';


// skills images
import SkillImg1 from './assets/img/skills/html5.png';
import SkillImg2 from './assets/img/skills/css3.png';
import SkillImg3 from './assets/img/skills/js.png';
import SkillImg4 from './assets/img/skills/reactjs.png';
import SkillImg6 from './assets/img/skills/nodejs.png';
import SkillImg7 from './assets/img/skills/git.png';


// testimonial images
import TestiImage1 from './assets/img/testimonials/testimonial-1.webp';
import TestiImage2 from './assets/img/testimonials/testimonial-2.webp';
import TestiImage3 from './assets/img/testimonials/testimonial-3.webp';

// navigation
export const navigation = [
  {
    name: 'Home',
    href: 'home',
  },
  {
    name: 'About',
    href: 'about',
  },
  {
    name: 'Portfolio',
    href: 'portfolio',
  },  
  
  {
    name: 'Contact',
    href: 'contact',
  },
];

// social
export const social = [
  {
    icon: <FaGithub size={"24"}/>,
    href: 'https://github.com/berklimoncu',
  },
  {
    icon: <FaLinkedin size={"24"} />,
    href: 'https://www.linkedin.com/in/berklimoncu/',
  },
  {
    icon: <FaMedium size={"24"}/>,
    href: 'https://medium.com/@berklimoncu',
  },
  {
    icon: <FaTwitterSquare size={"24"} />,
    href: 'https://twitter.com/berklimoncu',
  },
];

export const socialMobile = [
  {
    icon: <FaGithub size={"24"} color={'white'}/>,
    href: 'https://github.com/berklimoncu',
  },
  {
    icon: <FaLinkedin size={"24"} color={'white'}/>,
    href: 'https://www.linkedin.com/in/berklimoncu/',
  },
  {
    icon: <FaMedium size={"24"} color={'white'}/>,
    href: 'https://medium.com/@berklimoncu',
  },
  {
    icon: <FaTwitterSquare size={"24"} color={'white'} />,
    href: 'https://twitter.com/berklimoncu',
  },
];

// projects
export const projectsData = [
  {
    id: '1',
    image: Project1,
    name: 'ViscoMap',
    category: 'web development',
    explanation: "With the help of this project you can calculate the visual complexity of the website by crawling the webpages belongs to the website",
    githublink:"https://github.com/berklimoncu/viscomap"
  },
  {
    id: '5',
    image: Project5,
    name: 'Pool Car',
    category: 'web development',
    explanation: "With the help of this project you can rent the available cars in the company",
    githublink:"https://github.com/berklimoncu/poolcar",
    drivelink:"https://drive.google.com/drive/folders/1-AXYmd4hSWjzkZdNkBCyGazmRLL8HHqn?usp=sharing"
  },
  {
    id: '6',
    image: Project6,
    name: 'Rent House',
    category: 'web development',
    explanation: "With the help of this project you can rent the available houses by providing the location that you want",
    githublink:"https://github.com/berklimoncu/poolcar",
    
  },
  {
    id: '3',
    image: Project3,
    name: 'OpenSea Clone',
    category: 'mobile development',
    explanation:"This application was built with Flutter, it's clone of OpenSea mobile application",
    githublink:"https://github.com/berklimoncu/opensea-clone"
  },
  {
    id: '2',
    image: Project2,
    name: 'Food Me',
    category: 'mobile development',
    explanation:"This application was built with Flutter to be runned different kinds of devices and, while developing this application different kinds of technologies were used like request API, Google Maps, Geolocator and Firebase",
    githublink:"https://github.com/berklimoncu/food-delivery"
  },
  {
    id: '4',
    image: Project4,
    name: 'BMI Calculator',
    category: 'mobile development',
    explanation:"This application was built with Flutter, It's a basic BMI calculator",
    githublink:"https://github.com/berklimoncu/hw3"
  },
];

// projects
export const projectsNav = [
  {
    name: 'all',
  },
  {
    name: 'web development',
  },
  {
    name: 'mobile development',
  },
  
];

// skill
export const skills = [
  {
    label:"HTML",
    icon:<SiHtml5 size={"72"}/>
  },
  {
    label:"CSS",
    icon:<SiCss3 size={"72"}/>
  },
  {
    label:"JavaScript",
    icon:<SiJavascript size={"72"}/>
  },
  {
    label:"React",
    icon:<SiReact size={"72"}/>
  },
 
 
  {
    label:"Git",
    icon:<SiGit size={"72"}/>
  },
  {
    label:"Flutter",
    icon:<SiFlutter size={"72"}/>
  },
 
];

// contact
export const contact = [
  {
    icon: <FiMail />,
    title: 'Have a question?',
    subtitle: 'I am here to help you.',
    description: 'Email me at berk.limoncu@gmail.com',
  },
  {
    icon: <FiMapPin />,
    title: 'Current Location',
    subtitle: 'Denizli, Turkey',
    description: 'Serving clients worldwide',
  },
];
