# uneets.js

Utility to abstract the definition of a component and setup a communication interface between the backend and the frontend.

## Usage

In essence, the main purpose of `uneets.js` is to provide an easy way for defining components. A component is any object with the following shape:

```javascript
{
  init(options, shared) {
  },
  stop(options, shared) {
  }
}
```

##### `options`

```
options: {
  children: Map<HTMLElement, childOptions> | undefined
  el: HTMLElement // element that was used to define the uneet.
  parent: {el: HTMLElement, parentProps} | undefined
  props: {} // attributes following the convention `data-<ns>-*`.
}
```

##### `shared`

`shared` is an object that is gonna be shared across `uneet's` as a second argument to the `init` or `stop` methods. This is useful for those cases when you need to share a common instance among components, like an `EventEmitter`. By default, `shared` contains a logger with the following signature:

```
shared: {
  log: {
    trace: (msg: string) => void;
    debug: (msg: string) => void;
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  }
}
```

Once we have our `Uneets` defined it's time to prepare them to be consumed:

```html
<html>

<body>
  <div data-gf-uneet="Something" data-gf-option1="1" data-gf-isvalid="false"></div>
  <script src="./bundle.js"></script>
</body>

</html>
```

```javascript
import Something from './uneets/something.js';

const factories = new Map([['Something', Something]]);

const u = uneet({
  factories,
});

u.start();
```

After calling the `start()` method all uneets within the page will be initialized (except the ones defined with Object syntax and using `autoInitialize: false`). For more info please check `/playground/index.ts`.

## API

#### `uneet`

```javascript
{
  // namespace for defining Uneets and its attributes
  namespaces?: Array<string>; // default: [gf] (ex: `data-gf-uneet`)
  // the element that is gonna be used as root when looking for uneets.
  parentSelector?: string | HTMLElement | Array<HTMLElement>; // default: 'body'
  //
  uneetSelector?: string; // default: `uneet` (ex: `data-gf-uneet="Something"`)
  factories: Map<
    string,
    {
      init: (o: IUneetOptions, s: ISharedOptions) => void;
    }
  >; // default: new Map(). Contains all the factories to initialize the uneets.
  shared?: ISharedOptions; // default: { log: logger }
}
```

#### `uneet` Methods

`start(options)`:

This method also accepts an object with the same properties as `uneet` and it allows to use different settings for different calls.

##### Example:

```javascript
import uneet from '@goodfolk/uneets.js';
import Tab from './uneets/tab.js';

const u = uneet({
  namespaces: ['rs'],
  parentSelector: '#root',
  factories: new Map([['Tab', Tab]]),
});
```

Once we have the setup complete we have a bunch of different ways of initializing our app.

```javascript
// 1. Starts all Uneets but don't initialize the ones with
// `autoInitialize: false`
// --------------------------------------------------
u.start();
```

```javascript
// 2. Starts a specified Uneet (and all uneets bellow) but
// don't initialize the ones with `autoInitialize: false`
// --------------------------------------------------
u.start({
  parentSelector: '#uneet-x',
});
```

```javascript
// 3. Starts a specified Uneet (and all uneets bellow) and
// initialize even the uneets with `autoInitialize: false`
// --------------------------------------------------
u.start({
  parentSelector: document.getElementById('uneet-x'), // or you could simply use as well '#uneet-x'
  force: true,
});
```

```javascript
// 4. Parse all Uneets within the page and then manually
//    initialize selected Uneets
// --------------------------------------------------
const globalMapElToProps = u.parse();
const filteredElems = [];
globalMapElToProps.forEach((options, el) => {
  const { name } = options;

  // Only instantiate components with this name. A bit of a silly
  // example since you this can be accomplish by using a selector
  // like the examples above but this shows a way of applying any
  // kind of filtering logic to decide which ones to actually instantiate.
  if (name === 'Something2') {
    filteredElems.push(el);
  }
});

u.start({
  parentSelector: filteredElems,
});
```

```javascript
// 5. `start` return an object containing (for now) to main keys:
//  - mapElToProps: it's a `Map` containing all the parsed dom elements
//    along with their respective props
//  - `shared`: Object containing all the utilities shared across Uneets.
//    Example: logger.
// --------------------------------------------------
const data = u.start();
console.log('u.start return data', data);
```

```javascript
// 6. `start` also let us to send a custom `shared` object that can include
//    any kind of functionality that we want to share across our Uneets. An
//    example of this could be a EventEmitter where we usually want to share
//    the same instance across components.
// --------------------------------------------------
const data = u.start({
  shared: {
    // this function is gonna be available to all Uneets.
    somethingShared: () => {
      console.log('Im shared!');
    },
  },
});

console.log('u.start return data', data);
```

## Playground

To play with the library you could run:

`yarn run playground`.

By default is gonna spin up a server at: `http://localhost:1234`
