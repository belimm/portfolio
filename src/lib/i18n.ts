export const LOCALES = ['en', 'tr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Home URL for each language. English stays at the root. */
export const LOCALE_PATHS: Record<Locale, string> = { en: '/', tr: '/tr' };

/** Interface text. Page content (projects, experience, …) comes from the API in the requested language. */
const en = {
   meta: {
      // Tab title: just the name, so no browser cuts it down to the role.
      title: 'Berk Limoncu',
      description:
         'Berk Limoncu is a full-stack developer in Istanbul building AI products, with a background in fintech.',
   },
   nav: { work: 'Work', experience: 'Experience', skills: 'Skills', contact: 'Contact', sections: 'Sections' },
   header: {
      clock: 'Istanbul',
      clockTitle: 'Local time in Istanbul',
      toDark: 'Switch to dark theme',
      toLight: 'Switch to light theme',
      language: 'Language',
   },
   hero: {
      readCv: 'Read my CV',
      getInTouch: 'Get in touch',
      openedCv: 'Opened the CV viewer',
      openedGithub: 'Opened GitHub',
      openedLinkedin: 'Opened LinkedIn',
      openedMail: 'Opened your mail app',
   },
   terminal: { label: 'Activity log' },
   work: {
      title: 'Work',
      builtWith: 'Built with: ',
      opened: (title: string) => `Opened ${title} in a new tab`,
      showMore: (count: number) => `Show ${count} more`,
      showLess: 'Show fewer',
      listed: (count: number) => `${count} projects`,
   },
   experience: { title: 'Experience', education: 'Education', at: 'at' },
   skills: { title: 'Skills' },
   contact: {
      title: 'Contact',
      lead: 'Have a role or a project in mind? Send me a message.',
      name: 'Name',
      email: 'Email',
      message: 'Message',
      send: 'Send message',
      sending: 'Sending…',
      sent: 'Message sent. Thank you!',
      tooMany: 'Too many messages from your connection. Please try again later.',
      failed: 'Something went wrong. Email me directly instead?',
      delivered: 'Message delivered',
   },
   cv: {
      preview: 'preview',
      previous: 'Previous page',
      next: 'Next page',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      download: 'Download',
      close: 'Close',
      loading: 'Opening the CV…',
      failed: "The preview didn't load.",
      openDirectly: 'Open the PDF directly',
   },
   footer: { updated: 'Last updated' },
};

export type Dictionary = typeof en;

const tr: Dictionary = {
   meta: {
      title: 'Berk Limoncu',
      description:
         "Berk Limoncu, İstanbul'da yapay zekâ ürünleri geliştiren, fintech geçmişine sahip bir full-stack geliştirici.",
   },
   nav: { work: 'İşler', experience: 'Deneyim', skills: 'Yetenekler', contact: 'İletişim', sections: 'Bölümler' },
   header: {
      clock: 'İstanbul',
      clockTitle: "İstanbul'da yerel saat",
      toDark: 'Koyu temaya geç',
      toLight: 'Açık temaya geç',
      language: 'Dil',
   },
   hero: {
      readCv: "CV'mi oku",
      getInTouch: 'İletişime geç',
      openedCv: 'CV görüntüleyici açıldı',
      openedGithub: 'GitHub açıldı',
      openedLinkedin: 'LinkedIn açıldı',
      openedMail: 'E-posta uygulaman açıldı',
   },
   terminal: { label: 'Etkinlik kaydı' },
   work: {
      title: 'İşler',
      builtWith: 'Kullanılanlar: ',
      opened: (title: string) => `${title} yeni sekmede açıldı`,
      showMore: (count: number) => `${count} proje daha göster`,
      showLess: 'Daha az göster',
      listed: (count: number) => `${count} proje`,
   },
   experience: { title: 'Deneyim', education: 'Eğitim', at: '·' },
   skills: { title: 'Yetenekler' },
   contact: {
      title: 'İletişim',
      lead: 'Aklında bir pozisyon ya da proje mi var? Bana yaz.',
      name: 'Ad',
      email: 'E-posta',
      message: 'Mesaj',
      send: 'Mesajı gönder',
      sending: 'Gönderiliyor…',
      sent: 'Mesajın gönderildi. Teşekkürler!',
      tooMany: 'Bağlantından çok fazla mesaj geldi. Lütfen daha sonra tekrar dene.',
      failed: 'Bir şeyler ters gitti. Bana doğrudan e-posta atmak ister misin?',
      delivered: 'Mesaj iletildi',
   },
   cv: {
      preview: 'önizleme',
      previous: 'Önceki sayfa',
      next: 'Sonraki sayfa',
      zoomOut: 'Uzaklaştır',
      zoomIn: 'Yakınlaştır',
      download: 'İndir',
      close: 'Kapat',
      loading: 'CV açılıyor…',
      failed: 'Önizleme yüklenemedi.',
      openDirectly: "PDF'i doğrudan aç",
   },
   footer: { updated: 'Son güncelleme' },
};

const dictionaries: Record<Locale, Dictionary> = { en, tr };

export function getDictionary(locale: Locale): Dictionary {
   return dictionaries[locale];
}

export const DATE_LOCALES: Record<Locale, string> = { en: 'en-GB', tr: 'tr-TR' };
