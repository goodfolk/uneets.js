export const toCamelCase = (s: string, dashChar = /-([a-z])/gi) =>
  s.replace(dashChar, (m, l) => l.toUpperCase())

export const getDataset = (el: HTMLElement) => {
  let dataset: {
    [name: string]: string | void
  } = {}

  if (el && el.dataset !== undefined) {
    dataset = {
      ...el.dataset,
    }
  } else {
    // browsers not supporting .dataset property (IE10 or lower) will fall here
    const regex = /^data-(.+)/
    const dashChar = /-([a-z])/gi
    let match
    const forEach = [].forEach
    dataset = {}
    if (el && el.hasAttributes()) {
      forEach.call(el.attributes, (attr: { name: string; value: string }) => {
        match = attr.name.match(regex)
        if (match) {
          dataset[toCamelCase(match[1], dashChar)] = attr.value
        }
      })
    }
  }

  return dataset
}

export const getUneetNamespace = (key: string) => {
  const re = /[^A-Z]+/
  const m = re.exec(key)

  if (m === null) return ''

  return m[0] && m[0].toLowerCase()
}

export const isObject = (value: any) => {
  const type = typeof value
  return value != null && (type === 'object' || type === 'function')
}

export const matches = (el: HTMLElement | Node, selector: string) => {
  const m = Element.prototype.matches || Element.prototype.msMatchesSelector

  return m.call(el, selector)
}

export const closest = (
  el: HTMLElement,
  selector: string,
  limitParent: HTMLElement = document.body,
  checkSelf = false
) => {
  let parent = checkSelf ? el : el.parentNode

  while (parent && parent !== limitParent) {
    if (matches(parent, selector)) return parent

    parent = parent.parentNode
  }
}

export interface IGetParentUneetOptions {
  namespaces: Array<string>
  uneetSelector: string
}
export const getParentUneet = (
  el: HTMLElement,
  options: IGetParentUneetOptions,
  limitParent: HTMLElement = document.body
) => {
  const { namespaces, uneetSelector } = options
  return closest(el, namespaces.map(ns => `[data-${ns}-${uneetSelector}]`).join(','), limitParent)
}

export const arrayOfN = (length: number, callback: (index: number) => any) =>
  Array.from({ length }, (_, index: number) => callback(index))
