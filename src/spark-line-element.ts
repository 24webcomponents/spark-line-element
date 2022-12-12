const html = String.raw
const css = String.raw
const sparkLineStyles = new CSSStyleSheet()
sparkLineStyles.replaceSync(css`
  :host {
    display: block;
    border: 1px solid black;
  }
  div {
    position: relative;
    height: 100px;
  }
`)

/**
 * An example Custom Element. This documentation ends up in the
 * README so describe how this elements works here.
 *
 * You can event add examples on the element is used with Markdown.
 *
 * ```
 * <spark-line></spark-line>
 * ```
 */
class SparkLineElement extends HTMLElement {
  #renderRoot!: ShadowRoot

  get #pointsSlot() {
    return this.#renderRoot.querySelector<HTMLSlotElement>('slot[name=points]')
  }

  get startTime(): Date {
    let lowest: Date | number = Infinity
    for (const point of this.querySelectorAll<SparkLinePointElement>('spark-line-point')) {
      if (+point.datetime < lowest) {
        lowest = point.datetime
      }
    }
    return new Date(lowest as Date)
  }

  get endTime(): Date {
    let highest: Date | number = -Infinity
    for (const point of this.querySelectorAll<SparkLinePointElement>('spark-line-point')) {
      if (+point.datetime > highest) {
        highest = point.datetime
      }
    }
    return new Date(highest as Date)
  }

  connectedCallback(): void {
    this.#renderRoot = this.attachShadow({mode: 'open', slotAssignment: 'manual'})
    this.#renderRoot.adoptedStyleSheets = [sparkLineStyles]
    this.#renderRoot.innerHTML = html`
      <div>
        <slot name="points"></slot>
        <caption>
          <slot></slot>
        </caption>
      </div>
    `

    this.#pointsSlot?.assign(...this.querySelectorAll('spark-line-point'))
  }
}

const sparkLinePointStyles = new CSSStyleSheet()
sparkLinePointStyles.replaceSync(css`
  div {
    border: 1px solid red;
    margin: 4px;
    display: inline-block;
    position: absolute;
    bottom: var(--point-value);
    left: var(--left-value);
  }
`)
// eslint-disable-next-line custom-elements/one-element-per-file, custom-elements/file-name-matches-element
class SparkLinePointElement extends HTMLElement {
  #renderRoot!: ShadowRoot
  static observedAttributes = ['value', 'datetime']

  #pointStyles = new CSSStyleSheet()

  get value() {
    return Number(this.getAttribute('value')) || 0
  }

  get datetime(): Date {
    return new Date(this.getAttribute('datetime') || 0)
  }

  connectedCallback() {
    this.#renderRoot = this.attachShadow({mode: 'open', slotAssignment: 'manual'})
    this.#renderRoot.adoptedStyleSheets = [sparkLinePointStyles, this.#pointStyles]
    this.#renderRoot.innerHTML = html`<div></div>`
  }

  attributeChangedCallback(name: 'value' | 'datetime', oldValue: string | null, newValue: string | null) {
    this.#pointStyles.replaceSync(
      css`
        div {
          --left-value: ${+this.datetime}px;
          --point-value: ${this.value}px;
        }
      `
    )
  }
}

declare global {
  interface Window {
    SparkLineElement: typeof SparkLineElement
  }
}

export default SparkLineElement

if (!window.customElements.get('spark-line')) {
  window.SparkLineElement = SparkLineElement
  window.customElements.define('spark-line', SparkLineElement)
}

if (!window.customElements.get('spark-line-point')) {
  window.SparkLinePointElement = SparkLinePointElement
  window.customElements.define('spark-line-point', SparkLinePointElement)
}
