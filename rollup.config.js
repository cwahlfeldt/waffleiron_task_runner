import typescript from 'rollup-plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify-es'

export default {
  plugins: [
    typescript(),
    commonjs(),
    process.env.NODE_ENV === 'production' ? uglify() : undefined,
    resolve(),
  ].filter(x => x !== undefined)
}
