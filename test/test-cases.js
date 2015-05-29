"use strict";

import assert from "assert"
import fs from "fs"
import path from "path"
import FileSystemLoader from "../src/file-system-loader"

let normalize = ( str ) => {
  return str.replace( /\r\n?/g, "\n" );
}

describe( "test-cases", () => {
  let testDir = path.join( __dirname, "test-cases" )
  fs.readdirSync( testDir ).forEach( testCase => {
    if ( fs.existsSync( path.join( testDir, testCase, "source.css" ) ) ) {
      it( "should " + testCase.replace( /-/g, " " ), done => {
        let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
        let loader = new FileSystemLoader()
        let expectedTokens = JSON.parse(fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ))
        loader.fetch(path.join(testDir, testCase, "source.css")).then(tokens => {
          assert.equal( loader.sources.join(""), expected )
          assert.equal( JSON.stringify(tokens), JSON.stringify(expectedTokens) )
        }).then(done, done)
      } );
    }
  } );
} );
