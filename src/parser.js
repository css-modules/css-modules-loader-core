const importRegexp = /^:import\((.+)\)$/

export default class Parser {
  constructor( pathFetcher ) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind( this )
    this.exportTokens = {}
    this.translations = {}
  }

  plugin( css, result ) {
    Promise.all( this.fetchAllImports( css ) ).then( _ => {
      css.each( node => {
        if ( node.type == "rule" && node.selector == ":export" ) this.handleExport( node )
      } )
    } )
  }

  fetchAllImports( css ) {
    let imports = []
    css.each( node => {
      if ( node.type == "rule" && node.selector.match( importRegexp ) ) {
        imports.push( this.fetchImport( node ) )
      }
    } )
    return imports
  }

  handleExport( exportNode ) {
    exportNode.each( decl => {
      if ( decl.type == 'decl' ) {
        this.exportTokens[decl.prop] = decl.value
      }
    } )
    exportNode.removeSelf()
  }

  fetchImport( importNode ) {
    let file = importNode.selector.match( importRegexp )[1]
    console.log(file)
    return this.pathFetcher(file).then(exports => {
      console.log(exports)
    })
  }
}
