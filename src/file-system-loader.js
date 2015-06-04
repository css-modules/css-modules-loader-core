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
  constructor( root ) {
    this.root = root
    this.sources = {}
    this.importNr = 0
  }

  fetch( _newPath, relativeTo, _trace ) {
    let newPath = _newPath.replace( /^["']|["']$/g, "" ),
      trace = _trace || String.fromCharCode( this.importNr++ )
    return new Promise( ( resolve, reject ) => {
      let rootRelativePath = path.resolve( path.dirname( relativeTo ), newPath ),
        fileRelativePath = this.root + rootRelativePath

      fs.readFile( fileRelativePath, "utf-8", ( err, source ) => {
        if ( err ) reject( err )
        Core.load( source, rootRelativePath, trace, this.fetch.bind( this ) )
          .then( ( { injectableSource, exportTokens } ) => {
            this.sources[trace] = injectableSource
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
