let sources = [], seenPaths = new Set()
let FileSystemFetcher = ( path ) => {
  return fs.readFilePromise( path, ( err, source ) => {
    return core.load( source, FileSystemFetcher ).then( stuff => {
      let { injectableSource, exportTokens } = stuff
      sources.push( injectableSource )
      return exportTokens
    } )
  } )
}

