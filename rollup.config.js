import typescript from 'rollup-plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify-es'
import json from 'rollup-plugin-json'

export default {
  treeshake: true,
  output: {
    name: 'bundle',
    format: 'iife',
  },
  plugins: [
    typescript({
      module: 'commonjs',
    }),
    commonjs({
      extensions: ['.ts', '.js', '.tsx', '.jsx']
    }),
    resolve({browser: true}),
    json(),
    process.env.NODE_ENV === 'production' ? uglify() : undefined,
  ].filter(x => x !== undefined),
}
