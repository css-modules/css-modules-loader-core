import assert from 'assert'
import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import FileSystemLoader from '../src/file-system-loader'

let normalize = ( str ) => {
  return str.replace( /\r\n?/g, '\n' );
}

const pipelines = {
  'test-cases': undefined,
  'cssi': []
}

Object.keys( pipelines ).forEach( dirname => {
  describe( dirname, () => {
    let testDir = join( __dirname, dirname )
    readdirSync( testDir ).forEach( testCase => {
      if ( existsSync( join( testDir, testCase, 'source.css' ) ) ) {
        it( 'should ' + testCase.replace( /-/g, ' ' ), done => {
          const loader = new FileSystemLoader({rootDir: testDir, use: pipelines[dirname]})

          let expected = normalize( readFileSync( join( testDir, testCase, 'expected.css' ), 'utf-8' ) )
          let expectedTokens = JSON.parse( readFileSync( join( testDir, testCase, 'expected.json' ), 'utf-8' ) )
          let filepath = join(testDir, testCase, 'source.css')

          loader.fetch(filepath, filepath, null)
            .then( tokens => {
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
  let testDir = join( __dirname, 'test-cases' )
  let testCase = 'multiple-sources';
  let dirname = 'test-cases';
  if ( existsSync( join( testDir, testCase, 'source1.css' ) ) ) {
    it( 'should ' + testCase.replace( /-/g, ' ' ), done => {
      const loader = new FileSystemLoader({rootDir: testDir, use: pipelines[dirname]})

      let expected = normalize( readFileSync( join( testDir, testCase, 'expected.css' ), 'utf-8' ) )
      let expectedTokens = JSON.parse( readFileSync( join( testDir, testCase, 'expected.json' ), 'utf-8' ) )
      let filepath1 = join(testDir, testCase, 'source1.css')
      let filepath2 = join(testDir, testCase, 'source2.css')

      loader.fetch( filepath1, filepath1, null ).then( tokens1 => {
        loader.fetch( filepath2, filepath2, null ).then( tokens2 => {
          assert.equal( loader.finalSource, expected )
          const tokens = Object.assign({}, tokens1, tokens2);
          assert.equal( JSON.stringify( tokens ), JSON.stringify( expectedTokens ) )
        } ).then( done, done )
      })
    } );
  }
} );
