import Core from './index.js'
import fs from 'fs'
import pathUtils from 'path'

class LoaderState {
  constructor() {
    this.loaderVars = {}
    this.parserVars = {}
  }
}

export default class FileSystemLoader {
  constructor( root ) {
    this.root = root
    this.sources = []
    this.seenPaths = new Set()
  }

  fetch( path, relativeTo ) {
    let state = new LoaderState(), vars = state.loaderVars
    vars.path = path.replace( /^["']|["']$/g, "" )
    return new Promise( ( resolve, reject ) => {
      vars.rootRelativePath = pathUtils.resolve( pathUtils.dirname( relativeTo ), vars.path )
      vars.fileRelativePath = this.root + rootRelativePath

      fs.readFile( fileRelativePath, "utf-8", ( err, source ) => {
        vars.source = source
        err ? reject( err ) : resolve( state )
      } )
    } )
  }

  load( state ) {
    let { source, rootRelativePath } = state.loaderVars
    console.log("LOADING " + rootRelativePath)
    return Core.load( source, rootRelativePath, this )
      .then( state => {
        console.log("LOADED " + rootRelativePath)
        this.sources.push( state.parserVars.injectableSource )
        return state
      } )
  }
}
