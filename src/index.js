import postcss from 'postcss'
import localByDefault from 'postcss-modules-local-by-default'
import extractImports from 'postcss-modules-extract-imports'
import scope from 'postcss-modules-scope'
import customMedia from 'postcss-custom-media'

import Parser from './parser'

export default class Core {
  constructor( plugins, postLinkers ) {
    this.plugins = plugins || Core.defaultPlugins
    this.postLinkers = postLinkers || Core.defaultPostLinkers
  }

  load( sourceString, sourcePath, trace, pathFetcher ) {
    let parser = new Parser( pathFetcher, trace ),
      pluginChain = this.plugins
        .concat( [parser.plugin] )
        .concat( this.postLinkers );

    return postcss( pluginChain )
      .process( sourceString, { from: "/" + sourcePath } )
      .then( result => {
        return { injectableSource: result.css, exportTokens: parser.exportTokens }
      } )
  }
}

// These four plugins are aliased under this package for simplicity.
Core.localByDefault = localByDefault
Core.extractImports = extractImports
Core.scope = scope
Core.customMedia = customMedia
Core.defaultPlugins = [localByDefault, extractImports, scope]
Core.defaultPostLinkers = [customMedia]
