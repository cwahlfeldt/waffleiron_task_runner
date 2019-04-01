module.exports = () => ({
  env        : 'development',
  proxy      : 'https://cwahlfeldt.github.io',
  staticDirs  : ['./public'], 
  port       : 3000,
  baseDir    : './',
  debug      : false,
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
  purgeCSSWhitelist: [
    './src/styles/variables.js'
  ],
  files : [
    './index.php',
    './functions.php',
    './tailwind.js',
    './src/**/*.*',
  ],
})
