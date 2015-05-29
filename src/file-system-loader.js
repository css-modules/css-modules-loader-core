import Core from './index.js'
import fs from 'fs'
import path from 'path'

export default class FileSystemLoader {
  constructor( root ) {
    this.root = root
    this.sources = []
    this.seenPaths = new Set()
  }

  fetch( _newPath, relativeTo ) {
    let newPath = _newPath.replace( /^["']|["']$/g, "" )
    return new Promise( ( resolve, reject ) => {
      let rootRelativePath = path.resolve( path.dirname( relativeTo ), newPath ),
        fileRelativePath = this.root + rootRelativePath
      console.log( newPath )
      console.log( relativeTo )
      console.log( rootRelativePath )
      console.log( fileRelativePath )

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
