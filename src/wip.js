const matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)')$/
const matchLet = /(?:,\s+|^)([\w-]+):?\s+("[^"]*"|'[^']*'|[^,]+)\s?/g

export default css => {
  let declarations = {}
  css.eachAtRule(/^-?let$/, atRule => {
    console.log(atRule.params)

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
}
