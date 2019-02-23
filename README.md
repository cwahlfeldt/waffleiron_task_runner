# Waffleiron

This was created as a replacement build system for sage wordpress starter theme. Its a dropin frontend builder in nodejs tailored towards minimal builds and simple configuration.

`npm i --D waffleiron`
or
`yarn add --dev waffleiron`

`waffles [--watch | -w, --build | -b]`

### `waffles.default.js`

```javascript
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
```
