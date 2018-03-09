import { getDataset, getUneetNamespace, isObject, getParentUneet, matches } from './utils'

// used for selecting uneets within the DOM: data-<ns>-<uneetSelector> (i.e [data-gf-uneet])
const UNEET_SELECTOR = 'uneet'

interface ISelectUneetsOptions {
  namespaces: Array<string>
  parentSelector?: string | HTMLElement | Array<HTMLElement>
  uneetSelector?: string
  includeParentSelector?: boolean
}

const selectUneets = (opt: ISelectUneetsOptions): Array<HTMLElement> => {
  const defaults = {
    // root element for looking up for uneets
    parentSelector: document.body,
    uneetSelector: UNEET_SELECTOR,
  }

  const options: ISelectUneetsOptions = {
    ...defaults,
    ...opt,
  }

  const { namespaces, uneetSelector, parentSelector } = options
  let parentEl
  const cssSelectors: Array<string> = []

  if (namespaces && Array.isArray(namespaces)) {
    namespaces.forEach(ns => {
      cssSelectors.push(`[data-${ns}-${uneetSelector}]`)
    })
  }

  if (typeof parentSelector === 'string') {
    parentEl = document.querySelector(parentSelector)
  } else {
    parentEl = parentSelector
  }

  if (parentEl === null || parentEl === undefined) {
    parentEl = document.body
  }

  const selector = cssSelectors.join(',')

  let childUneets: Array<HTMLElement> = []
  // if it is an array it means we are sending an array of elements
  // instead of a plain selector or DOM element so
  // we'll have to query each element separately to
  // grab all their children
  if (Array.isArray(parentEl)) {
    childUneets = parentEl.reduce((reducer, el) => {
      const elChilds = Array.from(el.querySelectorAll(selector))

      return [...reducer, ...elChilds]
    }, childUneets)
  } else {
    childUneets = Array.from(parentEl.querySelectorAll(selector))
  }

  // const childUneets: Array<HTMLElement> = Array.from(parentEl.querySelectorAll(selector));

  if (options.includeParentSelector === true) {
    let matchedParents: Array<HTMLElement> = []

    if (Array.isArray(parentEl)) {
      parentEl.forEach(el => {
        if (matches(el, selector)) {
          matchedParents.push(el)
        }
      })
    } else if (matches(parentEl, selector)) {
      matchedParents.push(parentEl)
    }

    return [...matchedParents, ...childUneets]
  }

  return childUneets
}

interface IFilterDataset {
  ds: {
    [key: string]: any
  }
  allowedNamespaces: Array<string>
  namespace?: string
  uneetSelector?: string
}

const filterDataset = (opt: IFilterDataset) => {
  const defaults = {
    uneetSelector: UNEET_SELECTOR,
  }

  const options: IFilterDataset = {
    ...defaults,
    ...opt,
  }

  const { ds, namespace: ns, uneetSelector, allowedNamespaces } = options

  let name = ''
  let namespace: string
  let parsedDataSet: {
    [key: string]: any
  } = {}
  let uneetOptions = {
    autoInitialize: true, // by default the Uneet will be automatically initialized
  }

  Object.keys(ds).forEach((k: string) => {
    let prop = ''
    let propLower = ''

    if (ns === undefined) {
      namespace = getUneetNamespace(k)
    }

    if (!allowedNamespaces.includes(namespace)) {
      return
    }

    // removes the namespace from the option
    prop = k.replace(new RegExp(`^${namespace}`), '')

    if (prop === '') {
      return
    }

    // decamelize the option name
    propLower = prop.charAt(0).toLowerCase() + prop.slice(1)

    // if the key is different from the uneetSelector it means it is an option value
    if (propLower !== uneetSelector) {
      try {
        const o = JSON.parse(ds[k])
        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns 'null', and typeof null === "object",
        // so we must check for that, too.
        if (
          (o && typeof o === 'object' && o !== null) ||
          ((o || o === 0) && typeof o === 'number') ||
          (o != null && typeof o === 'boolean')
        ) {
          parsedDataSet[propLower] = o
        }
      } catch (e) {
        parsedDataSet[propLower] = ds[k]
      }
    } else {
      // Uneets can be defined using a plain `string` or with `object` notation
      // which allows the uneet to define lazy init plus other properties.
      try {
        const optionsObj: { name: string; autoInitialize: string } | string = JSON.parse(ds[k])

        if (typeof optionsObj === 'string') {
          name = optionsObj
        } else if (isObject(optionsObj)) {
          if (optionsObj.name === undefined) {
            throw new Error('[parser] Property name is required when using object notation')
          }

          name = optionsObj.name

          // to ensure that `.autoInitialize` is Boolean.
          if (Object.prototype.hasOwnProperty.call(optionsObj, 'autoInitialize')) {
            optionsObj.autoInitialize = JSON.parse(optionsObj.autoInitialize)
          }

          Object.assign(uneetOptions, optionsObj)
        }
      } catch (e) {
        // if we enter here it means it should be a string.
        name = ds[k]
      }
    }
  })

  return {
    uneetOptions, // uneet settings (like `autoInitialize`)
    props: parsedDataSet, // parsed data-<ns>-*
    name,
  }
}

type UneetsRelationshipTracking = Array<{
  parent: HTMLElement | Node
  child: {
    el: HTMLElement
    name: string
    props: {}
  }
}>

interface IParseOptionsConfig {
  namespaces: Array<string>
  uneetSelector: string
}

const parseOptions = (
  el: HTMLElement,
  config: IParseOptionsConfig,
  relationshipTracker: UneetsRelationshipTracking // this element is mutated
) => {
  const { namespaces } = config
  const dataset = getDataset(el)

  const { name, uneetOptions, props } = filterDataset({
    ds: dataset,
    allowedNamespaces: namespaces,
  })

  const parsedData = {
    name,
    uneetOptions,
    el,
    props,
  }

  const parentUneet = getParentUneet(el, config)

  if (parentUneet) {
    relationshipTracker.push({
      parent: parentUneet,
      child: {
        el,
        name,
        props,
      },
    })
  }

  return parsedData
}

const updateParentChildProps = (
  relationships: UneetsRelationshipTracking,
  elToPropsMapper: Map<
    HTMLElement | Node,
    {
      __children?: Map<HTMLElement, {}>
      __parent?: HTMLElement | Node
      __parentProps?: {}
    }
  >
) => {
  if (relationships.length === 0) {
    return
  }

  relationships.forEach(({ parent, child }) => {
    const { el } = child

    if (elToPropsMapper.has(parent)) {
      const parentProps = elToPropsMapper.get(parent)

      // Gets the props from the parent so we can extend them
      const elParentProps = elToPropsMapper.get(parent)
      // Gets props from the child so we can keep track of them
      const elProps = elToPropsMapper.get(el)
      const childProps = elProps || {}

      // if the parent doesn't have props associated yet or
      // it is the first time we are trying to relate it to
      // to a child
      if (elParentProps) {
        if (elParentProps.__children) {
          const extendedChildren = elParentProps.__children.set(el, childProps)

          // __children will basically store a map of children and their props
          elToPropsMapper.set(parent, {
            ...parentProps,
            __children: extendedChildren,
          })
        } else {
          elToPropsMapper.set(parent, {
            ...parentProps,
            __children: new Map([[el, childProps]]),
          })
        }
      }

      if (elToPropsMapper.has(el)) {
        const childProps = elToPropsMapper.get(el)

        elToPropsMapper.set(el, {
          ...childProps,
          __parent: parent,
          __parentProps: parentProps,
        })
      }
    }
  })
}

export interface IParserOptions {
  namespaces?: Array<string>
  parentSelector?: string | HTMLElement | Array<HTMLElement>
  uneetSelector?: string
  includeParentSelector?: boolean // when looking for Uneets, if true, it start looking
  // from the `parentElement` instead of its children
}

const parser = (
  opt: IParserOptions = {}
): Map<
  HTMLElement,
  {
    name: string
    props: {}
    uneetOptions: {
      autoInitialize: boolean
    }
    el: HTMLElement
  }
> => {
  const defaults = {
    namespaces: ['gf'],
    parentSelector: 'body',
    uneetSelector: 'uneet',
    includeParentSelector: true,
  }
  const options = {
    ...defaults,
    ...opt,
    mapElToProps: new Map(),
  }

  const { mapElToProps } = options
  const uneets = selectUneets(options)

  // during props parsing we are also gonna detect parent-child relationships
  const uneetsRelationshipTracking = uneets.reduce((reducer, uneetEl) => {
    const { el, ...rest } = parseOptions(uneetEl, options, reducer)

    mapElToProps.set(el, rest)

    return reducer
  }, [])

  updateParentChildProps(uneetsRelationshipTracking, mapElToProps)

  return mapElToProps
}

export default parser
