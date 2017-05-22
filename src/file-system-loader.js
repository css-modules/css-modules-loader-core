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
    this.traces = {}
    this.importNr = 0
    this.core = new Core(plugins)
    this.tokensByFile = {}
    this.resolvedPaths = {}
  }

  fetch( _newPath, relativeTo, _trace ) {
    let newPath = _newPath.replace( /^["']|["']$/g, "" ),
      trace = _trace || String.fromCharCode( this.importNr++ )
    return new Promise( ( resolve, reject ) => {
      let relativeDir = path.dirname( relativeTo ),
        rootRelativePath = path.resolve( relativeDir, newPath ),
        fileRelativePath = path.resolve( path.join( this.root, relativeDir ), newPath )

      // if the path is not relative or absolute, try to resolve it in node_modules
      if (newPath[0] !== '.' && newPath[0] !== '/') {
        try {
          fileRelativePath = require.resolve(newPath)
          // Record the resolved path since this might be inside node_modules
          this.resolvedPaths[rootRelativePath] = path.dirname(fileRelativePath)
        }
        catch (e) {}
      } else {
        // Relative path but might be relative to a node_modules module
        if (this.resolvedPaths[relativeTo]) {
          fileRelativePath = path.resolve(this.resolvedPaths[relativeTo], newPath)
        }
      }

      const tokens = this.tokensByFile[fileRelativePath]
      if (tokens) { return resolve(tokens) }

      fs.readFile( fileRelativePath, "utf-8", ( err, source ) => {
        if ( err ) reject( err )
        this.core.load( source, rootRelativePath, trace, this.fetch.bind( this ) )
          .then( ( { injectableSource, exportTokens } ) => {
            this.sources[fileRelativePath] = injectableSource
            this.traces[trace] = fileRelativePath
            this.tokensByFile[fileRelativePath] = exportTokens
            resolve( exportTokens )
          }, reject )
      } )
    } )
  }

  get finalSource() {
    const traces = this.traces
    const sources = this.sources
    let written = new Set()

    return Object.keys( traces ).sort( traceKeySorter ).map(key => {
      const filename = traces[key]
      if (written.has(filename)) { return null }
      written.add(filename)

      return sources[filename];
    }).join( "" )
  }
}
