import './src/styles/main.css'
import { loadNonCriticalFonts } from './src/fontLoader'
// Lazy load non-critical fonts
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    loadNonCriticalFonts().then(() => {
      document.body.classList.add('non-critical-fonts-loaded');
    });
  });
} else {
  setTimeout(() => {
    loadNonCriticalFonts().then(() => {
      document.body.classList.add('non-critical-fonts-loaded');
    });
  }, 1);
}

document.querySelector('#app').innerHTML = `
  <div>
   Hello Vite!
  </div>
`

setupCounter(document.querySelector('#counter'))
