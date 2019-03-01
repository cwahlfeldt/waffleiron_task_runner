module.exports = () => ({
  env        : 'development',
  proxy      : 'https://cwahlfeldt.github.io',
  port       : 3000,
  baseDir    : './',
  outDir     : './public',
  cache      : './cache',
  scripts    : './src/scripts/index.ts',
  styles     : './src/styles/index.scss',
  outScript  : 'bundle.js',
  outStyle   : 'bundle.css',
  styleVars  : './src/styles/common/variables.scss',
  sourcemaps : true,
  logLevel   : 'info',
  files : [
    './index.php',
    './functions.php',
    './tailwind.js',
    './src/**/*.*',
  ],
})
