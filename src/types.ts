export interface IUneetOptions {
  el: HTMLElement;
  props: {};
  parent: { el?: HTMLElement; props?: {} } | undefined;
  children: Map<HTMLElement, {}> | undefined;
}

export interface ISharedOptions {
  log?: {
    trace: (msg: string) => void;
    debug: (msg: string) => void;
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
  [n: string]: any;
}
