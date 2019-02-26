var proxy = require('http-proxy-middleware')
var historyApiFallback = require('connect-history-api-fallback')

module.exports = () => ({
  env: 'development',
  outDir: 'public',
  cache: '.cache',
  browsersync: {
    init: {
      notify: true,
      server: {
        baseDir: './',
        port: 3000,
        middleware: [
          proxy('**', {
            target: 'https://cwahlfeldt.github.io',
            changeOrigin: true,
            logLevel: 'debug',
          }),
        ]
      },
    },
    plugins: ['browser-sync-logger'],
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
