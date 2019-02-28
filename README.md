# Waffleiron

This was created as a replacement build system for sage wordpress starter theme. Its a dropin frontend builder in nodejs tailored towards minimal builds and simple configuration.

`npm i --D waffleiron`
or
`yarn add --dev waffleiron`

`waffles [--watch | -w, --build | -b]`

### `waffles.default.js`

```javascript
module.exports = () => ({
  env        : 'development',
  proxy      : 'https://cwahlfeldt.github.io',
  port       : 3000,
  baseDir    : './',
  outDir     : './public',
  cache      : './cache',
  scripts    : './src/scripts/index.ts',
  styles     : './src/styles/index.css',
  outScript  : 'bundle.js',
  outStyle   : 'bundle.css',
  sourcemaps : true,
  logLevel: 'info',
  files: [
    './index.php',
    './functions.php',
    './tailwind.js',
    './src/**/*.*',
  ],
})
```
