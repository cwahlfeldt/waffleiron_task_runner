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
  viewsDir   : './src/views',
  outScript  : 'bundle.js',
  scripts    : './src/scripts/index.ts',
  scriptsDir : './src/scripts',
  outStyle   : 'bundle.css',
  styles     : './src/styles/index.scss',
  stylesDir  : './src/styles',
  styleVars  : './src/styles/variables.js',
  sourcemaps : true,
  logLevel   : 'info',
  files : [
    './index.php',
    './functions.php',
    './tailwind.js',
    './src/**/*.*',
  ],
})
```
