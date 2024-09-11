import { loadNonCriticalFonts } from './fontLoader'
import { renderHomePage } from './tools/home'
import './tools/neumorphism-generator'
import { neumorphicGeneratorPage } from './tools/neumorphism-generator'

// Lazy load non-critical fonts
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    loadNonCriticalFonts().then(() => {
      document.body.classList.add('non-critical-fonts-loaded')
    })
  })
} else {
  setTimeout(() => {
    loadNonCriticalFonts().then(() => {
      document.body.classList.add('non-critical-fonts-loaded')
    })
  }, 1)
}
function hideThemeBtn() {
  const themeBtn = document.querySelector('#theme-btn')
  const themeLink = document.querySelector('link[data-theme]')
  if (themeLink) {
    const themePath = 'src/styles/themes/_light.css'
    themeLink.setAttribute('href', themePath)
  }

  if (themeBtn) {
    ;(themeBtn as HTMLElement).style.display = 'none'
  }
}
const routes: Record<string, () => void> = {
  // '/': renderHomePage,
  '/': () => {
    renderHomePage()
    hideThemeBtn()
    neumorphicGeneratorPage()
  },
  // '/shadowGenerator': shadowGeneratorPage,
}
function renderNotFound() {
  return `<h1>Page not found</h1>`
}
function router() {
  const path = window.location.pathname
  const renderFnOnCurrentPath = routes[path] || renderNotFound
  renderFnOnCurrentPath()
}
window.addEventListener('popstate', router)
window.addEventListener('DOMContentLoaded', router)

function preventPageReload(e: MouseEvent) {
  const targetElement = e.target as HTMLElement
  if (
    targetElement instanceof HTMLAnchorElement &&
    targetElement.matches('[data-link]')
  ) {
    e.preventDefault()
    history.pushState(null, targetElement.title, targetElement.href)
    router()
  }
}
document.body.addEventListener('click', preventPageReload)
