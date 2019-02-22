import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

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
    commonjs()
  ]
}
