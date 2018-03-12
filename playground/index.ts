import uneet from '../src/uneet';
import { ISharedOptions } from '../src/types';

const factories = new Map([
  // this is an example: this map should be passed by the consumer.
  [
    'Something',
    {
      init: (o: {}, s: ISharedOptions) => {
        const { log, somethingShared } = s;

        log.info('========> 1');

        if (typeof somethingShared === 'function') {
          somethingShared();
        }
      },
    },
  ],
  [
    'Something2',
    {
      init: (o: {}, s: ISharedOptions) => {
        console.log('========> 2', o, s);
      },
    },
  ],
  [
    'Something3',
    {
      init: (o: {}, s: {}) => {
        console.log('========> 3', o, s);
      },
    },
  ],
]);

document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <div data-gf-uneet='{"autoInitialize": true, "name": "Something"}'></div>
    <div data-gf-uneet='{"autoInitialize": false, "name": "Something"}' data-gf-pepe="hola 1" data-gf="asd">
      <div data-gf-uneet="Something3"></div>
    </div>
    <div data-gf-uneet="Something" data-gf-papa="pepe"></div>
    <div data-gf-uneet="Something2" id="uneet-x" data-gf-pepe="hola 2" data-gf="asd" data-gf-isvalid="true" data-gf-collection='[{ "some": "value" }]' data-gf-num="2">
      <div data-gf-uneet='{"autoInitialize": false, "name": "Something"}' data-gf-something="else"></div>
      <div data-gf-uneet="Something3"></div>
      <div data-gf-uneet="Something3"></div>
      <div data-gf-uneetxxx="Something2">
        <!-- this won't be initialized since we didn't configure Uneet to use this namespace. -->
      </div>
    </div>
  `
);

// creates the instance and sets up the `factories` that are
// gonna be used to instantiate each uneet.
const u = uneet({
  factories,
});

// ==================================================
// EXAMPLES
// ==================================================

// 1. Starts all Uneets
// --------------------------------------------------
// u.start();

// 2. Starts a specified Uneet (and all uneets bellow) but
// don't initialize the ones with `autoInitialize: false`
// --------------------------------------------------
// u.start({
//   parentSelector: '#uneet-x',
// });

// 3. Starts a specified Uneet (and all uneets bellow) and
// initialize even the uneets with `autoInitialize: false`
// --------------------------------------------------
// u.start({
//   parentSelector: document.getElementById('uneet-x'), // or you could simply use as well '#uneet-x'
//   force: true,
// });

// 4. Parse all Uneets within the page and then manually
//    initialize selected Uneets
// --------------------------------------------------
// const globalMapElToProps = u.parse();
// const filteredElems = [];
// globalMapElToProps.forEach((options, el) => {
//   const { name } = options;

//   // Only instantiate components with this name. A bit of a silly
//   // example since you this can be accomplish by using a selector
//   // like the examples above but this shows a way of applying any
//   // kind of filtering logic to decide which ones to actually instantiate.
//   if (name === 'Something2') {
//     filteredElems.push(el);
//   }
// });

// u.start({
//   parentSelector: filteredElems,
// });

// 5. `start` return an object containing (for now) to main keys:
//  - mapElToProps: it's a `Map` containing all the parsed dom elements
//    along with their respective props
//  - `shared`: Object containing all the utilities shared across Uneets.
//    Example: logger.
// --------------------------------------------------
// const data = u.start();
// console.log('u.start return data', data);

// 6. `start` also let us to send a custom `shared` object that can include
//    any kind of functionality that we want to share across our Uneets. An
//    example of this could be a EventEmitter where we usually want to share
//    the same instance across components.
// --------------------------------------------------
const data = u.start({
  shared: {
    somethingShared: () => {
      console.log('Im shared!');
    },
  },
});

console.log('u.start return data', data);
