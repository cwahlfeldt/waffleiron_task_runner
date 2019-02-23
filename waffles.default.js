module.exports = () => ({
  env: 'development',
  outDir: 'public',
  cache: '.cache',
  browsersync: {
    init: {
      notify: true,
      proxy: 'https://cwahlfedt.github.io',
      plugins: ['browser-sync-logger'],
    },
    files: [
      './index.php',
      './functions.php',
      './tailwind.js',
      './src/**/*.*',
    ],
  },
  rollup: {
    input: './src/scripts/index.ts',
    output: {
      file: './public/bundle.js',
      format: 'iife',
      sourcemap: true,
    },
  }
})
