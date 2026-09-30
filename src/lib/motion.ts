/**
 * Runs in <head> before the first paint. Marks the page as animated unless the visitor asked for reduced
 * motion; the section reveals only hide content under this flag, so nothing stays hidden without JS.
 */
export const motionBootScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='on'}catch(e){}`;
