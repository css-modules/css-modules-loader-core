const matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)')$/
const matchLet = /(?:,\s+|^)([\w-]+):?\s+("[^"]*"|'[^']*'|[^,]+)\s?/g
const matchConstName = /[\w-]+/g

export default css => {
  let declarations = {}
  css.eachAtRule(/^-?let$/, atRule => {
    let matches
    while (matches = matchLet.exec(atRule.params)) {
      let [/*match*/, key, value] = matches
      declarations[key] = value
    }
  })
  css.eachAtRule(/^-?import$/, atRule => {
    let imports = matchImports.exec(atRule.params)
    if (imports) {
      //console.log(imports)
    } else {
      console.log(atRule.params)
    }
  })
  /* Perform replacements */
  css.eachDecl(decl => {
    let matches
    while (matches = matchConstName.exec(decl.value)) {
      let replacement = declarations[matches[0]]
      if (replacement) {
        decl.value = decl.value.slice(0, matches.index) + replacement + decl.value.slice(matchConstName.lastIndex)
        matchConstName.lastIndex -= matches[0].length - replacement.length
      }
    }
  })
}
