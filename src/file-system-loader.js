import Core from './index.js'
import fs from 'fs'

export default class FileSystemLoader {
  constructor() {
    this.sources = []
    this.seenPaths = new Set()
  }

  fetch( path ) {
    return new Promise( ( resolve, reject ) => {
      return fs.readFile( path, ( err, source ) => {
        if (err) reject(err)
        return Core.load( source, this.fetch.bind(this) ).then( stuff => {
          let { injectableSource, exportTokens } = stuff
          this.sources.push( injectableSource )
          return exportTokens
        } )
      } )
    } )
  }
}
