import Core from './index.js'
import fs from 'fs'
import path from 'path'

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
  constructor( root, plugins ) {
    this.root = root
    this.sources = {}
    this.importNr = 0
    this.core = new Core(plugins)
    this.tokensByFile = {};
  }

  fetch( _newPath, sourcePath, _trace ) {
    let newPath = _newPath.replace( /^["']|["']$/g, "" ),
      trace = _trace || String.fromCharCode( this.importNr++ )

    return new Promise( ( resolve, reject ) => {
      let filename = path.resolve( path.dirname( sourcePath ), newPath );

      if (newPath[0] !== '.' && newPath[0] !== '/') {
        try {
          filename = require.resolve( newPath )
        }
        catch (e) {
          return void reject(e)
        }
      }

      const tokens = this.tokensByFile[filename]
      if (tokens) { return resolve(tokens) }

      fs.readFile( filename, "utf-8", ( err, source ) => {
        if ( err ) {
          return void reject( err )
        }

        this.core.load( source, filename, trace, this.fetch.bind( this ) )
          .then( ( { injectableSource, exportTokens } ) => {
            this.sources[trace] = injectableSource
            this.tokensByFile[filename] = exportTokens
            resolve( exportTokens )
          }, reject )
      } )
    } )
  }

  get finalSource() {
    return Object.keys( this.sources ).sort( traceKeySorter ).map( s => this.sources[s] )
      .join( "" )
  }
}
