import Core from './index.js'
import fs from 'fs'
import path from 'path'

export default class FileSystemLoader {
  constructor( root ) {
    this.root = root
    this.sources = []
    this.seenPaths = new Set()
  }

  fetch( newPath, relativeTo ) {
    return new Promise( ( resolve, reject ) => {
        let fileRelativePath = path.resolve( path.resolve( this.root, relativeTo), newPath ),
          rootRelativePath = path.relative( this.root, fileRelativePath )
      console.log(fileRelativePath)
      console.log(rootRelativePath)

      fs.readFile( fileRelativePath, "utf-8", ( err, source ) => {
        if ( err ) reject( err )
        Core.load( source, rootRelativePath, this.fetch.bind( this ) )
          .then( ( { injectableSource, exportTokens } ) => {
            this.sources.push( injectableSource )
            resolve( exportTokens )
          }, reject )
      } )
    } )
  }
}
