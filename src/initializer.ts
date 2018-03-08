export interface IMapElToPropsOptions {
  name: string
  props: {}
  uneetOptions: {
    autoInitialize: boolean
  }
  el: HTMLElement
  __parent?: HTMLElement
}

export type TMapElToProps = Map<HTMLElement, IMapElToPropsOptions>

export interface IInitializerOptions {
  uneets: TMapElToProps
  factories: Map<
    string,
    {
      init: (o: {}, s: {}) => void
    }
  >
}

// if one of its parent's has `autoInitialize: false` child components
// won't be initialized
const shouldInitialize = (
  el: HTMLElement,
  elProps: IMapElToPropsOptions,
  mapElToProps: TMapElToProps
): boolean => {
  const { uneetOptions: { autoInitialize }, __parent } = elProps

  if (!autoInitialize) return false

  if (__parent !== undefined) {
    const newProps = mapElToProps.get(__parent)

    if (newProps === undefined) {
      return false
    }

    return shouldInitialize(__parent, newProps, mapElToProps)
  }

  return true
}

const initializer = (options: IInitializerOptions) => {
  const { uneets, factories } = options

  uneets.forEach((uneet, el) => {
    if (shouldInitialize(el, uneet, uneets)) {
      const { name, props } = uneet

      const factory = factories.get(name)

      if (factory) {
        factory.init(props, {})
      }
    }
  })
}

export default initializer
