const importRegexp = /^:import\((.+)\)$/

export default class Parser {
  constructor( pathFetcher ) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind( this )
    this.exportTokens = {}
    this.translations = {}
  }

  plugin( css, result ) {
    return this.fetchAllImports( css )
      .then( _ => this.extractExports( css ) )
  }

  fetchAllImports( css ) {
    let imports = []
    css.each( node => {
      if ( node.type == "rule" && node.selector.match( importRegexp ) ) {
        imports.push( this.fetchImport( node, css.source.input.from ) )
      }
    } )
    return Promise.all( imports )
      .then( fetchedState => {
        return Promise.all( fetchedState.map(
          ( {loaderData, propResolver} ) =>
            this.pathFetcher.load( loaderData ).then( propResolver )
        ) )
      } )
  }

  extractExports( css ) {
    css.each( node => {
      if ( node.type == "rule" && node.selector == ":export" ) this.handleExport( node )
    } )
  }

  handleExport( exportNode ) {
    exportNode.each( decl => {
      if ( decl.type == 'decl' ) {
        Object.keys( this.translations ).forEach( translation => {
          decl.value = decl.value.replace( translation, this.translations[translation] )
        } )
        this.exportTokens[decl.prop] = decl.value
      }
    } )
    exportNode.removeSelf()
  }

  fetchImport( importNode, relativeTo ) {
    let file = importNode.selector.match( importRegexp )[1]
    console.log("FETCHING " + file)
    return this.pathFetcher.fetch( file, relativeTo )
      .then( loaderData => ({
        loaderData,
        propResolver: exports => {
          console.log("RESOLVING " + file)
          importNode.each( decl => {
            if ( decl.type == 'decl' ) {
              this.translations[decl.value] = exports[decl.prop]
            }
          } )
          importNode.removeSelf()
        }
      }) )
  }
}
