import Core from './index.js'
import fs from 'fs'
import path from 'path'
import {parse} from 'postcss';
import selectorHas from 'selector-has'
import partialRight from 'lodash.partialright'

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

  fetch( _newPath, relativeTo, _trace, composedClasses ) {
    let newPath = _newPath.replace( /^["']|["']$/g, "" ),
      trace = _trace || String.fromCharCode( this.importNr++ )
    return new Promise( ( resolve, reject ) => {
      let relativeDir = path.dirname( relativeTo ),
        rootRelativePath = path.resolve( relativeDir, newPath ),
        fileRelativePath = path.resolve( path.join( this.root, relativeDir ), newPath )

      // if the path is not relative or absolute, try to resolve it in node_modules
      if (newPath[0] !== '.' && newPath[0] !== '/') {
        try {
          fileRelativePath = require.resolve(newPath);
        }
        catch (e) {}
      }

      fs.readFile( fileRelativePath, 'utf-8', ( err, source ) => {

      if (composedClasses) {
        let root = parse(source);

        let exportedNames = {};

        root.each( node => {
          if ( node.type === 'rule' && node.selector === ':export' ) {
            node.each( decl => {
              exportedNames[decl.prop] = decl.value;
            } )
          }
        } )

        root.each(decl => {
          if (!composedClasses.some(name => {
            if (exportedNames[name]) {
              name = exportedNames[name]
            }
            return decl.selector === ':export' || selectorHas(decl.selector, name)
          })) {
            decl.removeSelf()
          }
        })
        source = root.toString()
      }

        if ( err ) reject( err )
        this.core.load( source, rootRelativePath, trace, partialRight(this.fetch.bind( this ), composedClasses) )
          .then( ( { injectableSource, exportTokens } ) => {
            this.sources[trace] = injectableSource
            this.tokensByFile[fileRelativePath] = exportTokens
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
