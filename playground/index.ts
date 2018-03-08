import uneet from '../src/uneet';

const u = uneet();

document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <div data-gf-uneet='{"autoInitialize": true, "name": "Something"}'></div>
    <div data-gf-uneet='{"autoInitialize": false, "name": "Something"}' data-gf-pepe="hola 1" data-gf="asd">
      <div data-gf-uneet="Something3"></div>
    </div>
    <div data-gf-uneet="Something" data-gf-papa="pepe"></div>
    <div data-gf-uneet="Something2" data-gf-pepe="hola 2" data-gf="asd">
      <div data-gf-uneet='{"autoInitialize": false, "name": "Something"}' data-gf-something="else"></div>
      <div data-gf-uneet="Something3"></div>
      <div data-gf-uneet="Something3"></div>
    </div>
  `
);

u.start();
