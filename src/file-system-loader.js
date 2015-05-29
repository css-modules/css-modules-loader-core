import Core from './index.js'
import fs from 'fs'

export default class FileSystemLoader {
  constructor() {
    this.sources = []
    this.seenPaths = new Set()
  }

  fetch( path ) {
    return new Promise( ( resolve, reject ) => {
      fs.readFile( path, "utf-8", ( err, source ) => {
        if ( err ) reject( err )
        Core.load( source, this.fetch.bind( this ) ).then( ( { injectableSource, exportTokens } ) => {
          this.sources.push( injectableSource )
          resolve( exportTokens )
        }, reject )
      } )
    } )
  }
}
