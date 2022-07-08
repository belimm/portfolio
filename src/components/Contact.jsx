import React,{useState} from 'react'


import { contact } from '../data';
import { ToastContainer, toast } from 'react-toastify';


function Contact() {
    var name="";
    const [toSend, setToSend] = useState({
    from_name: '',
    to_name: '',
    message: '',
    reply_to: '',
  });

  const onSubmit = (e) => {
    e.preventDefault();
    console.log("Tıklandııı");
  };

  const handleChange = (e) => {
    setToSend({ ...toSend, [e.target.name]: e.target.value });
    
    console.log(e.target.name);
  };


    const sendMail  = ()=>{
      console.log("Mail yollandııı");
      toast.success('Mail was sent to!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
    }

    return (
        <section className='section bg-primary' id='contact'>
          <div className='container mx-auto'>
            <div className='flex flex-col items-center text-center'>
              <h2 className='section-title before:content-contact relative before:absolute before:opacity-40 before:-top-7 before:-left-40 before:hidden before:lg:block'>
                Contact me
              </h2>
              <p className='subtitle'>
                If you have any concerns, you can reach me via <br/> <a href="mailto:berk.limoncu@gmail.com"style={{color:"orange"}}>berk.limoncu@gmail.com</a>
              </p>
            </div>
            <div
              className='flex flex-col lg:gap-x-8 lg:flex-row'
            >
              <div
                className='flex flex-1 flex-col items-start space-y-8 mb-12 lg:mb-0 lg:pt-2'
              >
                {contact.map((item, index) => {
                  const { icon, title, subtitle, description } = item;
                  return (
                    <div className='flex flex-col lg:flex-row gap-x-4' key={index}>
                      <div className='text-accent rounded-sm w-14 h-14 flex items-start justify-center mt-2 mb-4 lg:mb-0 text-2xl'>
                        {icon}
                      </div>
                      <div>
                        <h4 className='font-body text-xl mb-1'>{title}</h4>
                        <p className='mb-1 text-paragraph'>{subtitle}</p>
                        <p className='text-accent font-normal '>{description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={onSubmit}
                className='space-y-8 w-full max-w-[780px]'
              >
                <div className='flex gap-8'>
                  <input className='input' type='text' placeholder='Your name'   onChange={handleChange} />
                  <input className='input' type='email' placeholder='Your email' onChange={handleChange}/>
                </div>
                <input className='input' type='text' placeholder='Subject' />
                <textarea
                  className='textarea'
                  placeholder='Your message'
                  
                  onChange={handleChange}
                ></textarea>
                  <button className='btn btn-lg bg-accent hover:bg-secondary-hover rounded-lg'>
                    Send message
                  </button>

              </form>
            </div>
          </div>
        </section>
      );
}

export default Contact