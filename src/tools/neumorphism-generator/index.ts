import { debug } from 'console'

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
    heightSlider?.addEventListener('input', this.handleHeightChange.bind(this))
    const selectElement = this.shadow.querySelector('select[data-type="shape"]')
    const shapeButtons = this.shadow.querySelectorAll('.neu-layout-btn')
    this.shadow
      .querySelectorAll('.neu-layout-btn')
      .forEach((button: Element) => {
        button.addEventListener('click', () => {
          if (selectElement) {
            shapeButtons.forEach((btn: Element) => {
              btn.classList.remove('selected')
            })
            button.classList.add('selected')
            selectElement.value = (button as any).dataset.layout
            selectElement.dispatchEvent(new Event('change'))
          }
        })
      })
    this.shadow.querySelector('.copy-btn').addEventListener('click', () => {
      const codeElement = this.shadow.querySelector('#codeToClipboard')
      const textToCopy = codeElement.textContent

      navigator.clipboard.writeText(textToCopy).then(
        () => {
          console.log('Copying to clipboard was successful!')
          // You can add some visual feedback here, like changing the button text temporarily
          const originalText = this.textContent
          this.textContent = 'Copied!'
          setTimeout(() => {
            this.textContent = originalText
          }, 2000)
        },
        function (err) {
          console.error('Could not copy text: ', err)
        }
      )
    })
    this.updateCodeValues()
  }
  handleHeightChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.style.setProperty('--element-height', value + 'px')
    this.updateCodeValues()
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

    const neumorphicElement = this.shadow.querySelector(
      '.neumorphic-element'
    ) as HTMLElement

    if (showHeight) {
      if (neumorphicElement) {
        neumorphicElement.style.height = 'var(--element-height)'
      }
      if (heightControl) {
        heightControl.classList.remove('hidden')
        heightControl.classList.add('rect-neu-box')
      }
    } else {
      if (neumorphicElement) {
        neumorphicElement.style.height = 'var(--element-size)'
      }
      if (heightControl) {
        heightControl.classList.add('hidden')
        heightControl.classList.remove('rect-neu-box')
      }
    }
    this.updateCodeValues()
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
    this.updateCodeValues()
  }

  handleElevationChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.updateNeumorphicStyle('elevation', value.toString())
    this.updateNeumorphicStyle('blur-radius', (+value * 2).toString())
    const blurElement = this.shadow.querySelector('[data-type=blur]')
    if (+value < 5) return
    blurElement.value = (+value * 2).toString()
    this.updateCodeValues()
  }

  handleIntensityChange(event: Event) {
    const target = event.target as HTMLInputElement
    const intensityValue = parseFloat(target.value)
    this.style.setProperty('--intensity', intensityValue.toString())
    const baseColor = this.getHostCSSVariable('--base-color').trim()
    const { darkShadow, lightShadow } = this.generateShadowColors(
      baseColor,
      intensityValue
    )

    this.style.setProperty('--shadow-color-dark', darkShadow)
    this.style.setProperty('--shadow-color-light', lightShadow)
    this.updateCodeValues()
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
    const intensity = this.style.getPropertyValue('--intensity') || 0.15
    const { darkShadow, lightShadow } = this.generateShadowColors(
      value,
      +intensity
    )
    this.style.setProperty('--shadow-color-dark', darkShadow)
    this.style.setProperty('--shadow-color-light', lightShadow)
    const isLightColor = this.isLightColor(value)
    if (isLightColor) {
      root.style.setProperty('--color-text', '#001f3f')
    } else {
      root.style.setProperty('--color-text', '#fff')
    }
    root.style.setProperty('--color-bg', value)
    this.updateCodeValues()
  }
  // -------------------------------------------------
  private generateShadowColors(
    baseColor: string,
    intensity: number
  ): { darkShadow: string; lightShadow: string } {
    const darkShadow = this.calculateDarkShadow(baseColor, +intensity)
    const lightShadow = this.calculateLightShadow(baseColor, +intensity)
    return { darkShadow, lightShadow }
  }

  private calculateDarkShadow(baseColor: string, intensity: number): string {
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)

    const newR = Math.round(r * (1 - intensity))
    const newG = Math.round(g * (1 - intensity))
    const newB = Math.round(b * (1 - intensity))

    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  private calculateLightShadow(baseColor: string, intensity: number): string {
    const r = parseInt(baseColor.slice(1, 3), 16)
    const g = parseInt(baseColor.slice(3, 5), 16)
    const b = parseInt(baseColor.slice(5, 7), 16)

    const factor = intensity * 1.5
    const newR = Math.min(255, Math.round(r * (1 + factor)))
    const newG = Math.min(255, Math.round(g * (1 + factor)))
    const newB = Math.min(255, Math.round(b * (1 + factor)))

    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  // -------------------------------------------------
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
    const heightCheckbox = this.shadow.querySelector('#neu--height')
    this.updateNeumorphicStyle('element-size', sizeValue + 'px')
    if (!heightCheckbox.checked) {
      this.updateNeumorphicStyle('element-height', sizeValue + 'px')
    }
    const elevationElement = this.shadow.querySelector('[data-type=elevation]')
    const elevationCalcVal = +sizeValue / 10 < 5 ? 5 : +sizeValue / 10
    elevationElement.value = elevationCalcVal.toString()
    this.updateNeumorphicStyle('blur-radius', (elevationCalcVal * 2).toString())
    this.updateNeumorphicStyle('elevation', elevationCalcVal.toString())
    const blurEle = this.shadow.querySelector('[data-type=blur]')
    if (+elevationCalcVal < 5) return
    blurEle.value = (+elevationCalcVal * 2).toString()
    this.updateCodeValues()
  }
  handleBlurChange(event: Event) {
    const target = event.target as HTMLInputElement
    const value = target.value
    this.updateNeumorphicStyle('blur-radius', (+value).toString())
    this.updateCodeValues()
  }

  handleRadiusChange(event: Event) {
    const target = event.target as HTMLInputElement
    this.updateNeumorphicStyle('border-radius', target.value + '%')
    this.updateCodeValues()
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
  private isLightColor(color: string): boolean {
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5
  }
  getHostCSSVariable(variableName: string): string {
    return getComputedStyle(this).getPropertyValue(variableName).trim()
  }

  updateNeumorphicStyle(property: string, value: string) {
    this.shadow.host.style.setProperty(`--${property}`, value)
  }
  updateCodeValues() {
    const neumorphicElement = this.shadow.querySelector('.neumorphic-element')
    const borderRadius = this.shadow.querySelector(
      '[data-value="border-radius"]'
    )
    const background = this.shadow.querySelector('[data-value="background"]')
    const boxShadow = this.shadow.querySelector('[data-value="box-shadow"]')
    const computedStyle = window.getComputedStyle(neumorphicElement)

    borderRadius.textContent = `${computedStyle.borderRadius};`
    background.textContent = `${this.rgbaToHex(computedStyle.backgroundColor)};`
    boxShadow.textContent = `${computedStyle.boxShadow};`
  }
  private rgbaToHex(rgba: string): string {
    const parts = rgba.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    )
    if (!parts) return rgba // Return original if not rgba

    const r = parseInt(parts[1], 10)
    const g = parseInt(parts[2], 10)
    const b = parseInt(parts[3], 10)

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
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
