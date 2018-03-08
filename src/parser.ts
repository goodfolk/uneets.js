import { getDataset, getUneetNamespace, isObject, getParentUneet } from './utils'

// used for selecting uneets within the DOM: data-<ns>-<uneetSelector> (i.e [data-gf-uneet])
const UNEET_SELECTOR = 'uneet'

interface ISelectUneetsOptions {
  namespaces: Array<string>
  parentSelector?: string
  uneetSelector?: string
}

const selectUneets = (opt: ISelectUneetsOptions): Array<HTMLElement | null> => {
  const defaults = {
    // root element for looking up for uneets
    parentSelector: 'body',
    uneetSelector: UNEET_SELECTOR,
  }

  const options: ISelectUneetsOptions = {
    ...defaults,
    ...opt,
  }

  const { namespaces, uneetSelector, parentSelector } = options
  let collection = null
  let parentEl: HTMLElement
  const cssSelectors = []

  if (namespaces && Array.isArray(namespaces)) {
    namespaces.forEach(ns => {
      cssSelectors.push(`[data-${ns}-${uneetSelector}]`)
    })
  }

  if (typeof parentSelector === 'string') {
    parentEl = document.querySelector(parentSelector)
  }

  if (parentEl === null || parentEl === undefined) {
    parentEl = document.body
  }

  collection = Array.from(parentEl.querySelectorAll(cssSelectors.join(',')))

  return collection
}

interface IFilterDataset {
  ds: Object
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
  let namespace
  let parsedDataSet = {}
  let uneetOptions = {
    autoInitialize: true, // by default the Uneet will be automatically initialized
  }

  Object.keys(ds).forEach(k => {
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
        const optionsObj = JSON.parse(ds[k])

        if (isObject(optionsObj)) {
          if (optionsObj.name === undefined) {
            throw new Error('[parser] Property name is required when using object notation')
          }

          const { name, ...rest } = optionsObj.name

          // to ensure that `.autoInitialize` is Boolean.
          if (Object.prototype.hasOwnProperty.call(optionsObj, 'autoInitialize')) {
            optionsObj.autoInitialize = JSON.parse(optionsObj.autoInitialize)
          }

          Object.assign(uneetOptions, optionsObj)
        } else {
          // if it's not an object any other type won't be acceptable.
          name = undefined
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
    options: {}
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
        options: uneetOptions,
      },
    })
  }

  return parsedData
}

const updateParentChildProps = (
  relationships: UneetsRelationshipTracking,
  elToPropsMapper: Map<HTMLElement | Node, {}>
) => {
  if (relationships.length === 0) {
    return
  }

  relationships.forEach(({ parent, child }) => {
    const { el } = child

    if (elToPropsMapper.has(parent)) {
      const parentProps = elToPropsMapper.get(parent)

      elToPropsMapper.set(parent, {
        ...parentProps,
        __children: el,
      })

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

interface IParserOptions {
  namespaces?: Array<string>
  parentSelector?: string
  uneetSelector?: string
}
const parser = (opt: IParserOptions = {}) => {
  const defaults = {
    namespaces: ['gf'],
    parentSelector: 'body',
    uneetSelector: 'uneet',
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

parser()

export default parser
