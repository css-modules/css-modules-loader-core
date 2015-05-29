export default class Parser {
  constructor( pathFetcher ) {
    this.pathFetcher = pathFetcher
    this.plugin = this.plugin.bind( this )
    this.exportTokens = {}
  }

  plugin( css, result ) {
    return new Promise( ( resolve, reject ) => {
      css.each( node => {
        if ( node.type == "rule" && node.selector == ":export" ) {
          node.each( decl => {
            if ( decl.type == 'decl' ) {
              this.exportTokens[decl.prop] = decl.value
            }
          } )
          node.removeSelf()
        }
      } )
      resolve( css )
    } )
  }
}
