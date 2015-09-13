const matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)')$/

export default css => {
  css.eachAtRule('alias', atRule => {
    let imports = matchImports.exec(atRule.params)
    if (imports) {

    } else {
      console.log(atRule.params)
    }
  })
}
