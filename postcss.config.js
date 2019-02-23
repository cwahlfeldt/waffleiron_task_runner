const fs = require('fs')

// if not using local tailwind config, use the default one in this package
const tailwindDir = fs.existsSync('./tailwind.js') ? process.cwd() + '/tailwind.js' : __dirname + '/tailwind.js'

module.exports = () => ({
  plugins: [
    require('postcss-easy-import'),
    require('postcss-simple-vars'),
    require('@csstools/postcss-sass'),
    require('tailwindcss')(tailwindDir),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('cssnano') : undefined,
  ].filter(x => x !== undefined)
})
