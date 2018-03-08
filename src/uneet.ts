import parser, { IParserOptions } from './parser'
import initializer from './initializer'

export default function Uneet(config: IParserOptions = {}) {
  return {
    start: () => {
      const parsedUneets = parser(config)

      initializer({
        uneets: parsedUneets,
        factories: new Map([
          [
            'Something',
            {
              init: (o: {}, s: {}) => {
                console.log('========> 1', o, s)
              },
            },
          ],
          [
            'Something2',
            {
              init: (o: {}, s: {}) => {
                console.log('========> 2', o, s)
              },
            },
          ],
          [
            'Somethin3',
            {
              init: (o: {}, s: {}) => {
                console.log('========> 3', o, s)
              },
            },
          ],
        ]),
      })
    },
  }
}
