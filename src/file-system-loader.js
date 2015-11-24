import core from './index'
import { readFile } from 'fs'
import { dirname, resolve } from 'path'

// Sorts dependencies in the following way:
// AAA comes before AA and A
// AB comes after AA and before A
// All Bs come after all As
// This ensures that the files are always returned in the following order:
// - In the order they were required, except
// - After all their dependencies
const traceKeySorter = ( a, b ) => {
  if ( a.length < b.length ) {
    return a < b.substring( 0, a.length ) ? -1 : 1
  } else if ( a.length > b.length ) {
    return a.substring( 0, b.length ) <= b ? -1 : 1
  } else {
    return a < b ? -1 : 1
  }
};

export default class FileSystemLoader {
  constructor( options, processorOptions = {} ) {
    this.processorOptions = processorOptions
    this.core = core( options, this.fetch.bind(this) )
    this.importNr = 0
    this.sources = {}
    this.tokensByFile = {}
  }

  fetch( to, from ) {
    return new Promise(( _resolve, _reject ) => {
      const filename = /\w/i.test(to[0])
        ? require.resolve(to)
        : resolve(dirname(from), to)

      const trace = String.fromCharCode( this.importNr++ )

      readFile( filename, 'utf8', (err, source) => {
        if (err) {
          return void _reject(err);
        }

        this.core.process( source, Object.assign( this.processorOptions, { from: filename } ) )
          .then( result => {
            this.sources[filename] = result.css
            this.tokensByFile[filename] = result.root.tokens

            // https://github.com/postcss/postcss/blob/master/docs/api.md#lazywarnings
            result.warnings().forEach(message => console.warn(message.text));

            _resolve( this.tokensByFile[filename] )
          } )
          .catch( _reject )
      } )
    })
  }

  get finalSource() {
    return Object.keys( this.sources ).sort( traceKeySorter ).map( s => this.sources[s] )
      .join( '' )
  }
}
