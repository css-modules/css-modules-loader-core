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

describe( 'async api', () => {
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

  // special case for testing multiple sources
  describe( 'multiple sources', () => {
    let testDir = path.join( __dirname, 'test-cases' )
    let testCase = 'multiple-sources';
    let dirname = 'test-cases';
    if ( fs.existsSync( path.join( testDir, testCase, "source1.css" ) ) ) {
      it( "should " + testCase.replace( /-/g, " " ), done => {
        let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
        let loader = new FileSystemLoader( testDir, pipelines[dirname] )
        let expectedTokens = JSON.parse( fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ) )
        loader.fetch( `${testCase}/source1.css`, "/" ).then( tokens1 => {
          loader.fetch( `${testCase}/source2.css`, "/" ).then( tokens2 => {
            assert.equal( loader.finalSource, expected )
            const tokens = Object.assign({}, tokens1, tokens2);
            assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )
          } ).then( done, done )
        })
      } );
    }
  } );
} );

describe( 'sync api', () => {
  Object.keys( pipelines ).forEach( dirname => {
    describe( dirname, () => {
      let testDir = path.join( __dirname, dirname )
      fs.readdirSync( testDir ).forEach( testCase => {
        if ( fs.existsSync( path.join( testDir, testCase, "source.css" ) ) ) {
          it( "should " + testCase.replace( /-/g, " " ), () => {
            let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
            let loader = new FileSystemLoader( testDir, pipelines[dirname] )
            let expectedTokens = JSON.parse( fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ) )
            let tokens = loader.fetchSync( `${testCase}/source.css`, "/" )
            assert.equal( loader.finalSource, expected )
            assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )
          } );
        }
      } );
    } );
  } )

  // special case for testing multiple sources
  describe( 'multiple sources', () => {
    let testDir = path.join( __dirname, 'test-cases' )
    let testCase = 'multiple-sources';
    let dirname = 'test-cases';
    if ( fs.existsSync( path.join( testDir, testCase, "source1.css" ) ) ) {
      it( "should " + testCase.replace( /-/g, " " ), () => {
        let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
        let loader = new FileSystemLoader( testDir, pipelines[dirname] )
        let expectedTokens = JSON.parse( fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ) )
        let tokens1 = loader.fetchSync( `${testCase}/source1.css`, "/" )
        let tokens2 = loader.fetchSync( `${testCase}/source2.css`, "/" )
        assert.equal( loader.finalSource, expected )
        const tokens = Object.assign({}, tokens1, tokens2);
        assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )
      } );
    }
  } );
} );
