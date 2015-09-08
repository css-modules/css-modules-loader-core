"use strict";

import assert from "assert"
import fs from "fs"
import path from "path"
import AsyncFileSystemLoader from "../src/async/file-system-loader"
import SyncFileSystemLoader from "../src/sync/file-system-loader"


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
        it( "should " + testCase.replace( /-/g, " " ) + '(async)', done => {
          let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
          let loader = new AsyncFileSystemLoader( testDir, pipelines[dirname] )
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
describe( 'multiple sources async', () => {
  let testDir = path.join( __dirname, 'test-cases' )
  let testCase = 'multiple-sources';
  let dirname = 'test-cases';
  if ( fs.existsSync( path.join( testDir, testCase, "source1.css" ) ) ) {
    it( "should " + testCase.replace( /-/g, " " ) + '(async)', done => {
      let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
      let loader = new AsyncFileSystemLoader( testDir, pipelines[dirname] )
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



Object.keys( pipelines ).forEach( dirname => {
  describe( dirname, () => {
    let testDir = path.join( __dirname, dirname )
    fs.readdirSync( testDir ).forEach( testCase => {
      if ( fs.existsSync( path.join( testDir, testCase, "source.css" ) ) ) {
        it( "should " + testCase.replace( /-/g, " " ) + '(sync)', () => {
          let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
          let loader = new SyncFileSystemLoader( testDir, pipelines[dirname] )
          let expectedTokens = JSON.parse( fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ) )
          let tokens = loader.fetch( `${testCase}/source.css`, "/" )
          assert.equal( loader.finalSource, expected )
          assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )

        } );
      }
    } );
  } );
} )

// special case for testing multiple sources
describe( 'multiple sources async', () => {
  let testDir = path.join( __dirname, 'test-cases' )
  let testCase = 'multiple-sources';
  let dirname = 'test-cases';
  if ( fs.existsSync( path.join( testDir, testCase, "source1.css" ) ) ) {
    it( "should " + testCase.replace( /-/g, " " ) + '(sync)', () => {
      let expected = normalize( fs.readFileSync( path.join( testDir, testCase, "expected.css" ), "utf-8" ) )
      let loader = new SyncFileSystemLoader( testDir, pipelines[dirname] )
      let expectedTokens = JSON.parse( fs.readFileSync( path.join( testDir, testCase, "expected.json" ), "utf-8" ) )
      let tokens1 = loader.fetch( `${testCase}/source1.css`, "/" )
      let tokens2 = loader.fetch( `${testCase}/source2.css`, "/" )
      assert.equal( loader.finalSource, expected )
      const tokens = Object.assign({}, tokens1, tokens2);
      assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )
    } );
  }
} );
