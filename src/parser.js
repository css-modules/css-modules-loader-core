const importRegexp = /^:import\((.+)\)$/

export default class Parser {
  constructor( pathFetcher ) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind( this )
    this.exportTokens = {}
  }

  plugin( css, result ) {
    return new Promise( ( resolve, reject ) => {
      css.each( node => {
        let { type, selector } = node
        if ( type == "rule" && selector == ":export" ) this.handleExport( node )
        if ( type == "rule" && selector.match(importRegexp) ) this.handleImport( node )
      } )
      resolve( css )
    } )
  }

  handleExport( exportNode ) {
    exportNode.each( decl => {
      if ( decl.type == 'decl' ) {
        this.exportTokens[decl.prop] = decl.value
      }
    } )
    exportNode.removeSelf()
  }

  handleImport( importNode ) {
    let file = importNode.selector.match(importRegexp)[1]
    console.log(file)
  }
}
