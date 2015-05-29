import postcss from 'postcss'
import localByDefault from 'postcss-modules-local-by-default'
import extractImports from 'postcss-modules-extract-imports'
import scope from 'postcss-modules-scope'

import parser from './parser'

export default {
  // These three plugins are aliased under this package for simplicity.
  localByDefault,
  extractImports,
  scope,

  // The default set of plugins
  plugins: [
    localByDefault,
    extractImports,
    scope
  ],

  load( sourceString, pathFetcher ) {
    console.log(sourceString)
    //let parser = new Parser( pathFetcher )
    //
    //return postcss( this.plugins.concat( [parser] ) )
    //  .process( sourceString )
    //  .then( result => {
    //
    //  } )


    return Promise.resolve({ injectableSource: sourceString, exportTokens: {} })
  }
}
