export interface IMapElToPropsOptions {
  name: string
  props: {}
  uneetOptions: {
    autoInitialize: boolean
  }
  el: HTMLElement
  __parent?: HTMLElement
  __parentProps?: {}
  __children?: Map<HTMLElement, {}>
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
  force?: boolean
}

// if one of its parent's has `autoInitialize: false` child components
// won't be initialized
const shouldInitialize = (
  el: HTMLElement,
  elProps: IMapElToPropsOptions,
  mapElToProps: TMapElToProps,
  force: boolean = false
): boolean => {
  if (force === true) return true

  const { uneetOptions: { autoInitialize }, __parent } = elProps

  if (!autoInitialize) return false

  if (__parent !== undefined) {
    const newProps = mapElToProps.get(__parent)

    if (newProps === undefined) {
      return false
    }

    return shouldInitialize(__parent, newProps, mapElToProps, force)
  }

  return true
}

const initializer = (options: IInitializerOptions) => {
  const { uneets, factories, force } = options

  uneets.forEach((uneet, el) => {
    if (shouldInitialize(el, uneet, uneets, force)) {
      const { name, props, __parent, __parentProps, __children } = uneet

      const factory = factories.get(name)

      if (factory) {
        factory.init(
          {
            el,
            props,
            parent: __parent
              ? {
                  el: __parent,
                  props: __parentProps,
                }
              : undefined,
            children: __children || undefined,
          },
          {} // TODO: replace {} with shared
        )
      } else {
        // TODO: log a warning once the internal logger is implemented.
      }
    }
  })
}

export default initializer
