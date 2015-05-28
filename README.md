# CSS Module Loader Core
> A loader-agnostic CSS Modules implementation, based on PostCSS

## API

### core.load( sourceString , pathFetcher ) =><br>&nbsp;&nbsp;Promise({ injectableSource, exportTokens })

Processes the input CSS `sourceString`, looking for dependencies such as `@import` or `:import`. When dependencies are found, it will ask the `pathFetcher` for each dependency, resolve & inline any imports, and return the following object:

- `injectableSource`: the final, merged CSS file without `@import` or `:import` statements
- `exportTokens`: the mapping from local name to scoped name, as described in the file's `:export` block

These should map nicely to what your build-tool-specific loader needs to do its job.

### core.plugins = pluginArray

The default set of plugins is [[postcss-modules-local-by-default](https://github.com/css-modules/postcss-modules-local-by-default), [postcss-modules-extract-imports](https://github.com/css-modules/postcss-modules-extract-imports), [postcss-modules-scope](https://github.com/css-modules/postcss-modules-scope)] (i.e. the CSS Modules specification). This can override which PostCSS plugins you wish to execute, e.g.

```js
import core from 'css-loader-core'
import autoprefixer from 'autoprefixer'
import colorFunctions from 'postcss-color-function'

// Don't run local-by-default, but use colorFunctions 
// beforehand and autoprefixer afterwards:
core.plugins = [
  colorFunctions, 
  core.plugins.extractImports, 
  core.plugins.scope, 
  autoprefixer("Last 2 Versions")
]
```

