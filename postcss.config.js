const fs = require('fs')
const tailwindDir = fs.existsSync('./tailwind.js') ? process.cwd() + '/tailwind.js' : __dirname + '/tailwind.js'
const defaultConfig = require(__dirname + '/waffles.default.js')
const userConfig = fs.existsSync(process.cwd() + '/waffles.config.js') ? require(process.cwd() + '/waffles.config.js')() : {}
const config = require('deepmerge')(defaultConfig(), userConfig)

module.exports = () => ({
  syntax: 'postcss-scss',
  plugins: [
    require('postcss-easy-import')({
      extensions: ['.css','.scss'],
    }),
    require('postcss-simple-vars')({
      variables: config.styleVars, 
    }),
    //require('@csstools/postcss-sass'),
    require('tailwindcss')(tailwindDir),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('cssnano') : undefined,
  ].filter(x => x !== undefined),
})
