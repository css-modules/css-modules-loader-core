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

      fs.readFile( fileRelativePath, "utf-8", ( err, source ) => {
        err ? reject( err ) : resolve( { source, rootRelativePath } )
      } )
    } )
  }

  load( {source, rootRelativePath} ) {
    console.log("LOADING " + rootRelativePath)
    return Core.load( source, rootRelativePath, this )
      .then( ( { injectableSource, exportTokens } ) => {
        console.log("LOADED " + rootRelativePath)
        this.sources.push( injectableSource )
        return exportTokens
      } )
  }
}
