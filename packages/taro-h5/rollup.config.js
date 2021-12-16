import { mergeWith } from 'lodash'
import { join } from 'path'
import alias from '@rollup/plugin-alias'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'
import postcss from 'rollup-plugin-postcss'

import exportNameOnly from './build/rollup-plugin-export-name-only'

const cwd = __dirname
const baseConfig = {
  external: ['@tarojs/runtime', '@tarojs/taro'],
  output: {
    format: 'cjs',
    sourcemap: false,
    exports: 'auto'
  },
  plugins: [
    alias({
      entries: {
        '@tarojs/taro': join(cwd, '../taro/src/index')
      }
    }),
    resolve({
      preferBuiltins: false,
      mainFields: ['main:h5', 'browser', 'module', 'jsnext:main', 'main']
    }),
    postcss(),
    babel(),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true
    })
  ]
}

const variesConfig = [{
  input: 'src/api/index.ts',
  output: {
    file: 'dist/taroApis.js'
  },
  plugins: exportNameOnly()
}, {
  input: 'src/index.ts',
  output: {
    format: 'esm',
    file: 'dist/index.js'
  }
}, {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.cjs.js'
  }
}]

export default variesConfig.map(v => {
  const customizer = function (objValue, srcValue) {
    if (Array.isArray(objValue)) {
      return objValue.concat(srcValue)
    }
    if (typeof objValue === 'object') {
      return mergeWith({}, objValue, srcValue, customizer)
    }
  }
  return mergeWith({}, baseConfig, v, customizer)
})
