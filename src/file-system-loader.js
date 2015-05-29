import Core from './index.js'
import fs from 'fs'
import _path from 'path'

export default class FileSystemLoader {
  constructor() {
    this.sources = []
    this.seenPaths = new Set()
  }

  fetch( path ) {
    return new Promise( ( resolve, reject ) => {
      fs.readFile( path, "utf-8", ( err, source ) => {
        if ( err ) reject( err )
        Core.load( source, "/" + _path.relative(__filename, path), this.fetch.bind( this ) ).then( ( { injectableSource, exportTokens } ) => {
          this.sources.push( injectableSource )
          resolve( exportTokens )
        }, reject )
      } )
    } )
  }
}
