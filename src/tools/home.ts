import './home.css'

function toggleTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light'
  const themeIconBtn = document.querySelector('.home--theme-btn')
  if (!themeIconBtn) return
  const themeIcon = themeIconBtn.firstElementChild
  if (!themeIcon) return
  let themePath
  if (currentTheme === 'light') {
    themeIcon.setAttribute('src', 'src/assets/icons/day-mode.png')
    localStorage.setItem('theme', 'dark')
    themePath = 'src/styles/themes/_dark.css'
  } else {
    themeIcon.setAttribute('src', 'src/assets/icons/night-mode.png')
    localStorage.setItem('theme', 'light')
    themePath = 'src/styles/themes/_light.css'
  }
  const themeLink = document.querySelector('link[data-theme]')
  if (themeLink) {
    themeLink.setAttribute('href', themePath)
  }
}
function getCardComponent(label: string, value: string, id: string) {
  return `
    <a href="/${id}" class ="card-button" id="${id}" data-link title="${id}">
    <span>${label}</span>
    <p>${value}</p>
    </a>
  `
}
export function renderHomePage() {
  const app = document.querySelector('#app')
  const currentTheme = localStorage.getItem('theme') || 'light'
  const themeLink = document.querySelector('link[data-theme]')
  let themePath

  if (currentTheme === 'light') {
    themePath = 'src/styles/themes/_light.css'
  } else {
    themePath = 'src/styles/themes/_dark.css'
  }
  if (themeLink) {
    themeLink.setAttribute('href', themePath)
  }
  const dayDynamicUrl = new URL(
    '../assets//icons//day-mode.png',
    import.meta.url
  )
  if (app) {
    app.innerHTML = `<div class="home-page">
  <header class="homepage--header">
    <button class="unstyled-button home--theme-btn" id="theme-btn" >
      <img src=${
        currentTheme === 'light'
          ? 'src/assets/icons/night-mode.png'
          : 'src/assets/icons/day-mode.png'
      } alt="light theme icon" width="30"
      height="30" />
    </button>
  </header>
  <main class="home-page-main">
    <div class="homepage--body">
      <div id="current-tool">
        <div class="homepage--title">
          <a href="/">
            <img
              class="homepage--css-generator-img"
              src="src/assets/icons/logo.png"
          /></a>
          <span class="homepage--subtitle"
            >The ultimate <span class="bold">CSS tools</span>&nbsp; for web
            designers</span
          >
        </div>
        <div class="homepage--cards">
          ${getCardComponent(
            'Neumorphism',
            `Create stunning 3D-like designs
          with ease. Adjust elevation, softness, and roundness to achieve the
          perfect neumorphic look. Fine-tune surface color and light direction
          for a polished finish. Craft intuitive interfaces with our
          user-friendly Neumorphism editor.`,
            'neumorphicGenerator'
          )}
        </div>
      </div>
    </div>
  </main>
  <footer class="home-page-footer"></footer>
</div>

    `
  }
  const themIconBtn = app?.querySelector('.home--theme-btn')
  if (themIconBtn) {
    themIconBtn.addEventListener('click', toggleTheme)
  }
}
