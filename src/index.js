import postcss from 'postcss';
import genericNames from 'generic-names';
import { relative } from 'path';

import LocalByDefault from 'postcss-modules-local-by-default'
import ExtractImports from 'postcss-modules-extract-imports'
import Scope from 'postcss-modules-scope'
import Parser from 'postcss-modules-parser'
import Values from 'postcss-modules-values'

/**
 * @param  {array}           options.append
 * @param  {array}           options.prepend
 * @param  {array}           options.use
 * @param  {function}        options.createImportedName
 * @param  {function|string} options.generateScopedName
 * @param  {string}          options.mode
 * @param  {string}          options.rootDir
 * @param  {function}        fetch
 * @return {object}
 */
export default function core({
  append = [],
  prepend = [],
  createImportedName,
  generateScopedName: scopedName,
  rootDir: context = process.cwd(),
  mode,
  use,
} = {}, _fetch) {
  let instance
  let generateScopedName

  const fetch = function () {
    return _fetch.apply(null, Array.prototype.slice.call(arguments).concat(instance));
  }

  if (scopedName) {
    // https://github.com/css-modules/postcss-modules-scope/blob/master/src/index.js#L38
    generateScopedName = typeof scopedName !== 'function'
      ? genericNames(scopedName || '[name]__[local]___[hash:base64:5]', {context})
      : (local, filepath, css) => scopedName(local, filepath, css, context)
  } else {
    generateScopedName = (localName, filepath) => {
      return Scope.generateScopedName(localName, relative(context, filepath));
    }
  }

  const plugins = (use || [
    ...prepend,
    Values,
    mode
      ? new LocalByDefault({mode})
      : LocalByDefault,
    createImportedName
      ? new ExtractImports({createImportedName})
      : ExtractImports,
    new Scope({generateScopedName}),
    ...append,
  ])
  .concat(new Parser({fetch})) // no pushing in order to avoid the possible mutations

  instance = postcss(plugins)
  return instance;
}
