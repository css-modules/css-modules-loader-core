import postcss from 'postcss';

const matchImports = /^(.+?)\s+from\s+("[^"]*"|'[^']*')$/
const matchLet = /(?:,\s+|^)([\w-]+):?\s+("[^"]*"|'[^']*'|[^,]+)\s?/g
const matchConstName = /[\w-]+/g
const matchImport = /^([\w-]+)(?:\s+as\s+([\w-]+))?/
let options = {}
let importIndex = 0
let createImportedName = options && options.createImportedName || ((importName/*, path*/) => `i__const_${importName.replace(/\W/g, '_')}_${importIndex++}`)

const replace = (declarations, object, propName) => {
  let matches
  while (matches = matchConstName.exec(object[propName])) {
    let replacement = declarations[matches[0]]
    if (replacement) {
      object[propName] = object[propName].slice(0, matches.index) + replacement + object[propName].slice(matchConstName.lastIndex)
      matchConstName.lastIndex -= matches[0].length - replacement.length
    }
  }
}

export default css => {
  /* Find any local let rules and store them*/
  let declarations = {}
  css.eachAtRule(/^-?let$/, atRule => {
    let matches
    while (matches = matchLet.exec(atRule.params)) {
      let [/*match*/, key, value] = matches
      declarations[key] = value
    }
  })

  console.log(declarations)
  /* We want to export anything defined by now, but don't add it to the CSS yet or
  it well get picked up by the replacement stuff */
  let exportDeclarations = Object.keys(declarations).map(key => postcss.decl({
    value: declarations[key],
    prop: key,
    before: "\n  ",
    _autoprefixerDisabled: true
  }))

  /* Find imports and insert ICSS tmp vars */
  let importAliases = []
  css.eachAtRule(/^-?import$/, atRule => {
    let matches = matchImports.exec(atRule.params)
    if (matches) {
      let [/*match*/, aliases, path] = matches
      let imports = aliases.split(/\s*,\s*/).map(alias => {
        let tokens = matchImport.exec(alias)
        if (tokens) {
          let [/*match*/, theirName, myName = theirName] = tokens
          let importedName = createImportedName(myName)
          declarations[myName] = importedName
          return {theirName, importedName}
        } else {
          throw new Error(`@import statement "${alias}" is invalid!`)
        }
      })
      importAliases.push({path, imports})
    }
  })

  /* Perform replacements */
  css.eachDecl(decl => replace(declarations, decl, 'value'))

  /* Add import rules */
  importAliases.forEach(({path, imports}) => {
    css.prepend(postcss.rule({
      selector: `:import(${path})`,
      after: "\n",
      nodes: imports.map(({theirName, importedName}) => postcss.decl({
        value: theirName,
        prop: importedName,
        before: "\n  ",
        _autoprefixerDisabled: true
      }))
    }))
  })

  /* Add export rules if any */
  if (exportDeclarations.length > 0) {
    css.prepend(postcss.rule({
      selector: `:export`,
      after: "\n",
      nodes: exportDeclarations
    }))
  }
}
