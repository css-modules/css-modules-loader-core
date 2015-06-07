"use strict";

import assert from "assert"
import fs from "fs"
import path from "path"
import FileSystemLoader from "../src/file-system-loader"

let normalize = ( str ) => {
  return str.replace( /\r\n?/g, "\n" );
}

const pipelines = {
  "test-cases": undefined,
  "cssi": []
}

Object.keys( pipelines ).forEach( dirname => {
  describe( dirname, () => {
    let testDir = path.join( __dirname, dirname )
    fs.readdirSync( testDir ).forEach( testCase => {
      if ( fs.existsSync( path.join( testDir, testCase, "source.css" ) ) ) {
        it( "should " + testCase.replace( /-/g, " " ), done => {
          let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
          let loader = new FileSystemLoader( testDir, pipelines[dirname] )
          let expectedTokens = JSON.parse( fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ) )
          loader.fetch( `${testCase}/source.css`, "/" ).then( tokens => {
            assert.equal( loader.finalSource, expected )
            assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )
          } ).then( done, done )
        } );
      }
    } );
  } );
} )
