import parser from '../src/parser'
import { arrayOfN } from '../src/utils'

test('`parser` should return a Map of all the components using the Uneet convention', () => {
  // mock of a possible config object
  const config = {
    namespaces: ['bar', 'foo'],
  }

  const content = []

  // array to hold all the generated names for the components
  const uneetNames = []
  const amountUneets = [arrayOfN(100, n => n)]
  const nestedUneets = []
  // helper variable to keep track of the number of components that shouldn't be
  // parsed by the method
  let notToBeParsed = 0
  // uneets using { ... autoInitialize: false ... }`.
  const notAutoInitialized = new Map()

  // generates test data/DOM elements
  amountUneets.forEach(() => {
    const div = document.createElement('div')
    const randomIndex = Math.floor(Math.random() * config.namespaces.length)
    // grabs a random namespace from the passed config
    let ns = config.namespaces[randomIndex]
    // randonly generates namespaces that don't belong to the supported namespaces
    if (Math.floor(Math.random() * 20) + 1 < 10) {
      // this will generate a namespace that won't be present in config.namespaces
      ns = `${ns}${Date.now()}`
      notToBeParsed += 1
    }
    const uneetDef = `${ns}-uneet`
    const objDef = `${ns}-obj`
    const arrDef = `${ns}-arr`
    const strDef = `${ns}-str`
    const numDef = `${ns}-num`
    const boolDef = `${ns}-bool`
    const uneetName = `bar${Date.now()}`
    uneetNames.push(uneetName)

    if (Math.floor(Math.random() * 2) === 1) {
      div.setAttribute(`data-${uneetDef}`, uneetName)
    } else {
      const shouldAutoInitialize = Math.floor(Math.random() * 2) === 1
      div.setAttribute(
        `data-${uneetDef}`,
        JSON.stringify({
          name: uneetName,
          autoInitialize: shouldAutoInitialize,
        })
      )

      if (!shouldAutoInitialize) {
        notAutoInitialized.set(div, uneetName)
      }
    }

    // options
    div.setAttribute(
      `data-${objDef}`,
      JSON.stringify({
        bar: 'foo',
        foo: 'baz',
      })
    )
    div.setAttribute(`data-${arrDef}`, JSON.stringify([1, 2]))
    div.setAttribute(`data-${strDef}`, 'baz')
    div.setAttribute(`data-${numDef}`, String(Math.floor(Math.random() * 20)))
    div.setAttribute(`data-${boolDef}`, String(Math.floor(Math.random() * 20) <= 10))

    content.push(div)

    /**
     * if true, the component will have a nested component.
     */
    if (Math.floor(Math.random() * 2) === 1 && config.namespaces.indexOf(ns) !== -1) {
      const nestedDiv = document.createElement('div')
      const nestedNs = config.namespaces[Math.floor(Math.random() * config.namespaces.length)]
      const nestedCompDef = `${nestedNs}-component`
      const nestedObjDef = `${nestedNs}-obj`
      const nestedArrDef = `${nestedNs}-arr`
      const nestedStrDef = `${nestedNs}-str`
      const nestedNumDef = `${nestedNs}-num`
      const nestedBoolDef = `${nestedNs}-bool`
      const nestedCmpName = `bar${Date.now()}`
      uneetNames.push(nestedCmpName)

      // options
      nestedDiv.setAttribute(
        `data-${nestedObjDef}`,
        JSON.stringify({
          bar: 'foo',
          foo: 'baz',
        })
      )
      nestedDiv.setAttribute(`data-${nestedArrDef}`, JSON.stringify([1, 2]))
      nestedDiv.setAttribute(`data-${nestedStrDef}`, 'baz')
      nestedDiv.setAttribute(`data-${nestedNumDef}`, String(Math.floor(Math.random() * 20)))
      nestedDiv.setAttribute(`data-${nestedBoolDef}`, String(Math.floor(Math.random() * 20) <= 10))

      nestedDiv.setAttribute(
        `data-${nestedCompDef}`,
        JSON.stringify({
          name: nestedCmpName,
          autoInitialize: false,
        })
      )

      // to keep track of nested componentd.
      nestedUneets.push(nestedDiv)

      // content is used to initialize `__selectComponents`
      content.push(nestedDiv)

      notAutoInitialized.set(nestedDiv, nestedCmpName)

      // div will be the wrapper component.
      div.appendChild(nestedDiv)
    }

    document.body.appendChild(div)
  })

  const goalParsedComponents = amountUneets.length + nestedUneets.length - notToBeParsed

  const parsedUneets = parser(config)

  expect(parsedUneets.size).toBe(goalParsedComponents)
})
