class NeumorphicGenerator extends HTMLElement {
  shadow: any
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'closed' })
    this.shadow = shadow
    const htmlUrl = new URL('./index.html', import.meta.url).href
    fetch(htmlUrl)
      .then((response) => response.text())
      .then((templateHtml) => {
        const template = document.createElement('template')
        template.innerHTML = templateHtml
        shadow.appendChild(template.content.cloneNode(true))
        this.attachEventListners()
        const root = document.documentElement
        root.style.setProperty(
          '--color-bg',
          this.getHostCSSVariable('--base-color')
        )
      })
  }
  connectedCallback() {}

  attachEventListners() {
    const elevationSlider = this.shadow.querySelector(
      '[data-type="elevation"]'
    ) as HTMLInputElement
    elevationSlider?.addEventListener(
      'input',
      this.handleElevationChange.bind(this)
    )

    // Intensity slider
    const intensitySlider = this.shadow.querySelector(
      '[data-type="intensity"]'
    ) as HTMLInputElement
    intensitySlider?.addEventListener(
      'input',
      this.handleIntensityChange.bind(this)
    )

    // Color picker
    const colorPicker = this.shadow.querySelector(
      '[data-type="colorPicker"]'
    ) as HTMLInputElement
    const colorInput = this.shadow.querySelector(
      '[data-type="colorInput"]'
    ) as HTMLInputElement

    colorPicker?.addEventListener('input', this.handleColorChange.bind(this))
    colorInput?.addEventListener('input', this.handleColorChange.bind(this))

    // Light direction buttons
    const lightButtons = this.shadow.querySelectorAll(
      '[data-type^="direction-"]'
    )
    lightButtons.forEach((button: HTMLElement) => {
      button.addEventListener('click', this.handleLightButtonClick.bind(this))
    })

    // Size slider
    const sizeSlider = this.shadow.querySelector(
      '[data-type="size"]'
    ) as HTMLInputElement
    sizeSlider?.addEventListener('input', this.handleSizeChange.bind(this))

    //Blur slider
    const blurSlider = this.shadow.querySelector(
      '[data-type="blur"]'
    ) as HTMLInputElement
    blurSlider?.addEventListener('input', this.handleBlurChange.bind(this))

    // Radius slider
    const radiusSlider = this.shadow.querySelector(
      '[data-type="radius"]'
    ) as HTMLInputElement
    radiusSlider?.addEventListener('input', this.handleRadiusChange.bind(this))

    // Shape selector
    const shapeSelector = this.shadow.querySelector(
      '[data-type="shape"]'
    ) as HTMLSelectElement
    shapeSelector?.addEventListener('change', this.handleShapeChange.bind(this))

    const heightSelector = this.shadow.querySelector(
      '[data-type="dimensions"]'
    ) as HTMLSelectElement
    heightSelector?.addEventListener('change', this.handleShowHeight.bind(this))

    const heightSlider = this.shadow.querySelector(
      '[data-type="height"]'
    ) as HTMLSelectElement
    heightSlider?.addEventListener('change', this.handleHeightChange.bind(this))
  }
  handleHeightChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.style.setProperty('--element-height', value + 'px')
    debugger
  }
  handleShowHeight(event: Event) {
    const target = event.target as HTMLInputElement
    const showHeight = target.checked
    const heightControl = this.shadow.querySelector(
      '.neu--height-control'
    ) as HTMLElement
    const elementSize =
      getComputedStyle(this).getPropertyValue('--element-size')
    this.style.setProperty('--element-height', elementSize)
    if (showHeight) {
      if (heightControl) {
        heightControl.classList.remove('hidden')
        heightControl.classList.add('rect-neu-box')
      }
    } else {
      if (heightControl) {
        heightControl.classList.add('hidden')
        heightControl.classList.remove('rect-neu-box')
      }
    }
  }
  handleShapeChange(event: Event) {
    const target = event.target as HTMLSelectElement
    const shape = target.value
    const element = this.shadow.querySelector('.neu-box--visual') as HTMLElement
    const colorPicker = this.shadow.querySelector(
      '[data-type="colorPicker"]'
    ) as HTMLInputElement
    const baseColor = colorPicker.value
    this.style.setProperty('--shadow-type', '')
    switch (shape) {
      case 'neu--flat':
        this.style.setProperty('--base-color', baseColor)

        break
      case 'neu--concave':
        const lightenedColor = this.adjustColor(baseColor, 15)
        const darkenedColor = this.adjustColor(baseColor, -15)
        this.style.setProperty(
          '--base-color',
          `linear-gradient(var(--gradient-angle), ${darkenedColor}, ${baseColor} 50%, ${lightenedColor})`
        )

        break
      case 'neu--convex':
        const lightenedColorVal = this.adjustColor(baseColor, 15)
        const darkenedColorVal = this.adjustColor(baseColor, -15)
        this.style.setProperty(
          '--base-color',
          `linear-gradient(var(--gradient-angle), ${lightenedColorVal}, ${baseColor} 50%, ${darkenedColorVal})`
        )
        break
      case 'neu--pressed':
        this.style.setProperty('--base-color', baseColor)
        this.style.setProperty('--shadow-type', 'inset')
        break
    }

    this.setAttribute('data-shape', shape)
  }

  handleElevationChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.updateNeumorphicStyle('elevation', value.toString())
    this.updateNeumorphicStyle('blur-radius', (+value * 2).toString())
    const blurElement = this.shadow.querySelector('[data-type=blur]')
    if (+value < 5) return
    blurElement.value = (+value * 2).toString()
  }

  handleIntensityChange(event: Event) {
    const target = event.target as HTMLInputElement
    const intensityValue = parseFloat(target.value)
    this.style.setProperty('--intensity', intensityValue.toString())
  }

  handleColorChange(event: Event) {
    const root = document.documentElement
    const target = event.target as HTMLInputElement
    const value = target.value
    if (value.length < 7) return
    const colorInput = this.shadow.querySelector('#neu--baseColorText')
    const colorPicker = this.shadow.querySelector('#neu--baseColor')
    colorInput.value = value
    colorPicker.value = value
    this.updateNeumorphicStyle('base-color', value)
    root.style.setProperty('--color-bg', value)
  }

  handleLightButtonClick(event: Event) {
    const target = event.target as HTMLElement
    const type = target.dataset.type

    // Remove 'glow-button' class from all light buttons
    const allLightButtons = this.shadow.querySelectorAll(
      '[data-type^="direction-"]'
    )
    allLightButtons.forEach((button: HTMLElement) =>
      button.classList.remove('glow-button')
    )

    // Add 'glow-button' class to the clicked button
    target.classList.add('glow-button')

    // Update shadow direction based on the clicked button
    switch (type) {
      case 'direction-top-left':
        this.style.setProperty('--gradient-angle', '145deg')
        this.style.setProperty('--shadow-direction-x-dark', '1')
        this.style.setProperty('--shadow-direction-y-dark', '1')
        this.style.setProperty('--shadow-direction-x-light', '-1')
        this.style.setProperty('--shadow-direction-y-light', '-1')
        break
      case 'direction-top-right':
        this.style.setProperty('--gradient-angle', '225deg')
        this.style.setProperty('--shadow-direction-x-dark', '-1')
        this.style.setProperty('--shadow-direction-y-dark', '1')
        this.style.setProperty('--shadow-direction-x-light', '1')
        this.style.setProperty('--shadow-direction-y-light', '-1')
        break
      case 'direction-bottom-left':
        this.style.setProperty('--gradient-angle', '45deg')
        this.style.setProperty('--shadow-direction-x-dark', '1')
        this.style.setProperty('--shadow-direction-y-dark', '-1')
        this.style.setProperty('--shadow-direction-x-light', '-1')
        this.style.setProperty('--shadow-direction-y-light', '1')
        break
      case 'direction-bottom-right':
        this.style.setProperty('--gradient-angle', '315deg')
        this.style.setProperty('--shadow-direction-x-dark', '-1')
        this.style.setProperty('--shadow-direction-y-dark', '-1')
        this.style.setProperty('--shadow-direction-x-light', '1')
        this.style.setProperty('--shadow-direction-y-light', '1')
        break
    }
  }

  handleSizeChange(event: Event) {
    const target = event.target as HTMLInputElement
    const sizeValue = target.value
    this.updateNeumorphicStyle('element-size', sizeValue + 'px')
    const elevationElement = this.shadow.querySelector('[data-type=elevation]')
    const elevationCalcVal = +sizeValue / 10 < 5 ? 5 : +sizeValue / 10
    elevationElement.value = elevationCalcVal.toString()
    this.updateNeumorphicStyle('blur-radius', (elevationCalcVal * 2).toString())
    this.updateNeumorphicStyle('elevation', elevationCalcVal.toString())
    const blurEle = this.shadow.querySelector('[data-type=blur]')
    if (+elevationCalcVal < 5) return
    blurEle.value = (+elevationCalcVal * 2).toString()
  }
  handleBlurChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    debugger
    this.updateNeumorphicStyle('blur-radius', (+value).toString())
  }

  handleRadiusChange(event: Event) {
    const target = event.target as HTMLInputElement
    this.updateNeumorphicStyle('border-radius', target.value + '%')
  }
  adjustColor(color: string, amount: number): string {
    const clamp = (num: number) => Math.min(Math.max(num, 0), 255)
    const hex = color.replace('#', '')
    const r = clamp(parseInt(hex.slice(0, 2), 16) + amount)
    const g = clamp(parseInt(hex.slice(2, 4), 16) + amount)
    const b = clamp(parseInt(hex.slice(4, 6), 16) + amount)
    return `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  getHostCSSVariable(variableName: string): string {
    return getComputedStyle(this).getPropertyValue(variableName).trim()
  }

  updateNeumorphicStyle(property: string, value: string) {
    this.shadow.host.style.setProperty(`--${property}`, value)
  }

  removeListeners() {
    const controlsContainer = this.shadow.querySelector('#neu-controls')
    if (controlsContainer) {
    }
  }
  disconnectedCallback() {
    this.removeListeners()
  }
}

customElements.define('neumorphic-generator', NeumorphicGenerator)
export function neumorphicGeneratorPage() {
  const app = document.querySelector('#app')
  const toolContainer = (app as HTMLElement).querySelector('#current-tool')
  if (!toolContainer) return
  toolContainer.innerHTML = `<neumorphic-generator>
  </neumorphic-generator>`
}
