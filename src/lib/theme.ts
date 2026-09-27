export type Theme = 'dark' | 'light';

export const DEFAULT_THEME: Theme = 'dark';
export const THEME_STORAGE_KEY = 'theme';
export const THEME_COLORS: Record<Theme, string> = { dark: '#1b1916', light: '#f1ece1' };

/**
 * Runs in <head> before the first paint so a saved light preference doesn't flash dark.
 * Kept tiny and dependency-free on purpose.
 */
export const themeBootScript = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=t==='light'?'${THEME_COLORS.light}':'${THEME_COLORS.dark}'}}catch(e){}`;
