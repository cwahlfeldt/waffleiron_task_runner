import typescript from 'rollup-plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

export default {
  input: './src/scripts/index.ts',
  output: {
    file: './public/bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    typescript(),
    commonjs(),
    process.env.NODE_ENV === 'production' ? uglify() : undefined,
  ].filter(x => x !== undefined)
}
