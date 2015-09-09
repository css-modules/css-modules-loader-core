const importRegexp = /^:import\((.+)\)$/

export default class Parser {
  constructor( pathFetcher, trace ) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind( this )
    this.exportTokens = {}
    this.translations = {}
    this.trace = trace
  }

  plugin( css, result ) {
    return Promise.all( this.fetchAllImports( css ) )
      .then( _ => this.linkImportedSymbols( css ) )
      .then( _ => this.extractExports( css ) )
  }

  fetchAllImports( css ) {
    let imports = []
    css.each( node => {
      if ( node.type == "rule" && node.selector.match( importRegexp ) ) {
        imports.push( this.fetchImport( node, css.source.input.from, imports.length ) )
      }
    } )
    return imports
  }

  linkImportedSymbols( css ) {
    css.eachDecl( decl => {
      Object.keys(this.translations).forEach( translation => {
        decl.value = decl.value.replace(translation, this.translations[translation])
      } )
    })
  }

  extractExports( css ) {
    css.each( node => {
      if ( node.type == "rule" && node.selector == ":export" ) this.handleExport( node )
    } )
  }

  handleExport( exportNode ) {
    exportNode.each( decl => {
      if ( decl.type == 'decl' ) {
        Object.keys(this.translations).forEach( translation => {
          decl.value = decl.value.replace(translation, this.translations[translation])
        } )
        this.exportTokens[decl.prop] = decl.value
      }
    } )
    exportNode.removeSelf()
  }

  fetchImport( importNode, relativeTo, depNr ) {
    let file = importNode.selector.match( importRegexp )[1],
      depTrace = this.trace + String.fromCharCode(depNr)
    return this.pathFetcher( file, relativeTo, depTrace ).then( exports => {
      importNode.each( decl => {
        if ( decl.type == 'decl' ) {
          this.translations[decl.prop] = exports[decl.value]
        }
      } )
      importNode.removeSelf()
    }, err => console.log( err ) )
  }
}
