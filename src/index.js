import postcss from 'postcss'
import localByDefault from 'postcss-modules-local-by-default'
import extractImports from 'postcss-modules-extract-imports'
import scope from 'postcss-modules-scope'

import Parser from './parser'

export default class Core {
  constructor( plugins ) {
    this.plugins = plugins || Core.defaultPlugins
  }

  load( sourceString, sourcePath, trace, pathFetcher ) {
    let parser = new Parser( pathFetcher, trace )

    return postcss( this.plugins.concat( [parser.plugin] ) )
      .process( sourceString, { from: "/" + sourcePath } )
      .then( result => {
        return { injectableSource: result.css, exportTokens: parser.exportTokens }
      } )
  }
}


// These three plugins are aliased under this package for simplicity.
Core.localByDefault = localByDefault
Core.extractImports = extractImports
Core.scope = scope
Core.defaultPlugins = [localByDefault, extractImports, scope]
