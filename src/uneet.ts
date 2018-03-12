import * as log from 'loglevel';

import p, { IParserOptions } from './parser';
import initializer from './initializer';
import { ISharedOptions, IUneetOptions } from './types';

export enum LogLevels {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  SILENT,
}

export interface IInitializeOptions extends IParserOptions {
  factories: Map<
    string,
    {
      init: (o: IUneetOptions, s: ISharedOptions) => void;
    }
  >;
  force?: boolean;
  includeParentSelector?: boolean;
  shared?: ISharedOptions;
  defaultLogLevel?: LogLevels;
}

export interface IUneetsExtendedOptions extends IParserOptions {
  factories?: Map<
    string,
    {
      init: (o: IUneetOptions, s: ISharedOptions) => void;
    }
  >;
  force?: boolean;
  includeParentSelector?: boolean;
  defaultLogLevel?: LogLevels;
  shared?: ISharedOptions;
}

const parse = (options: IInitializeOptions = { factories: new Map() }, parser = p) =>
  parser(options);

const start = (options: IInitializeOptions = { factories: new Map() }, parser = p) => {
  const { factories, force } = options;
  const mapElToProps = parse(options);

  const shared = {
    log, // the logger is provided by default but it can be overwritten if needed.
    ...options.shared,
  };

  initializer({
    uneets: mapElToProps,
    factories,
    force,
    shared,
  });

  return {
    mapElToProps,
    shared,
  };
};

export interface IUneetsOptions {
  namespaces?: Array<string>;
  parentSelector?: string;
  uneetSelector?: string;
  factories: Map<
    string,
    {
      init: (o: IUneetOptions, s: ISharedOptions) => void;
    }
  >;
  shared?: ISharedOptions;
}

export default function Uneet(opt: IUneetsOptions = { factories: new Map(), shared: {} }) {
  const defaultLogLevel: LogLevels = LogLevels.WARN;

  const defaults = {
    defaultLogLevel,
  };

  const options = {
    ...defaults,
    ...opt,
  };

  return {
    parse: (configExtend: IUneetsExtendedOptions = {}) => {
      return parse({
        ...options,
        ...configExtend,
      });
    },
    start: (configExtend: IUneetsExtendedOptions = {}) => {
      return start({
        ...options,
        ...configExtend,
      });
    },
  };
}
