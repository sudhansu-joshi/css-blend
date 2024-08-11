// fontLoader.js
const loadFont = (weight, url) => {
  return new Promise((resolve, reject) => {
    const font = new FontFace('Overpass', `url(${url})`, { weight })
    font
      .load()
      .then(() => {
        document.fonts.add(font)
        resolve()
      })
      .catch(reject)
  })
}

export const loadNonCriticalFonts = () => {
  return Promise.all([
    loadFont('300', '/assets/fonts/Overpass-Light.woff2'),
    loadFont('600', '/assets/fonts/Overpass-SemiBold.woff2'),
  ])
}
