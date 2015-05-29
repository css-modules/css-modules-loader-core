const importRegexp = /^:import\((.+)\)$/

export default class Parser {
  constructor( pathFetcher ) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind( this )
    this.exportTokens = {}
    this.translations = {}
  }

  plugin( css, result ) {
    return Promise.all( this.fetchAllImports( css ) ).then( _ => {
      css.each( node => {
        if ( node.type == "rule" && node.selector == ":export" ) this.handleExport( node )
      } )
    } )
  }

  fetchAllImports( css ) {
    let imports = []
    css.each( node => {
      if ( node.type == "rule" && node.selector.match( importRegexp ) ) {
        imports.push( this.fetchImport( node, css.source.input.from ) )
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

  fetchImport( importNode, relativeTo ) {
    let file = importNode.selector.match( importRegexp )[1]
    importNode.removeSelf()
    return this.pathFetcher(file, relativeTo).then(exports => {
      console.log("got export")
      console.log(exports)
    }, err => console.log(err))
  }
}
