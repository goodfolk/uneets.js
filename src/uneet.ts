import p, { IParserOptions } from './parser'
import initializer from './initializer'

export interface IInitializeOptions extends IParserOptions {
  factories: Map<
    string,
    {
      init: (o: {}, s: {}) => void
    }
  >
  force?: boolean
  includeParentSelector?: boolean
}

export interface IUneetsExtendedOptions extends IParserOptions {
  factories?: Map<
    string,
    {
      init: (o: {}, s: {}) => void
    }
  >
  force?: boolean
  includeParentSelector?: boolean
}

const parse = (options: IInitializeOptions = { factories: new Map() }, parser = p) =>
  parser(options)

const start = (options: IInitializeOptions = { factories: new Map() }, parser = p) => {
  const { factories, force } = options
  const mapElToProps = parse(options)

  initializer({
    uneets: mapElToProps,
    factories,
    force,
  })

  return {
    mapElToProps,
  }
}

export interface IUneetsOptions {
  namespaces?: Array<string>
  parentSelector?: string
  uneetSelector?: string
  factories: Map<
    string,
    {
      init: (o: {}, s: {}) => void
    }
  >
}

export default function Uneet(options: IUneetsOptions = { factories: new Map() }) {
  return {
    parse: (configExtend: IUneetsExtendedOptions = {}) => {
      return parse({
        ...options,
        ...configExtend,
      })
    },
    start: (configExtend: IUneetsExtendedOptions = {}) => {
      return start({
        ...options,
        ...configExtend,
      })
    },
  }
}
