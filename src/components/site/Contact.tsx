import { Profile } from '../../lib/content';
import { Dictionary } from '../../lib/i18n';
import ContactForm from './ContactForm';
import Section, { stagger } from './Section';
import styles from './Contact.module.css';

export default function Contact({ profile, t }: { profile: Profile; t: Dictionary }) {
   return (
      <Section id="contact" index="05" title={t.contact.title}>
         <div className={styles.grid}>
            <div className="sr" style={stagger(0, 220)}>
               <p className={styles.lead}>
                  {t.contact.lead}
               </p>
               {profile.email && (
                  <a className={styles.email} href={`mailto:${profile.email}`}>
                     {profile.email}
                  </a>
               )}
            </div>
            <div className="sr" style={stagger(1, 220)}>
               <ContactForm t={t.contact} />
            </div>
         </div>
      </Section>
   );
}
