const fs = require('fs')
const tailwindDir = fs.existsSync('./tailwind.js') ? process.cwd() + '/tailwind.js' : __dirname + '/tailwind.js'

module.exports = () => ({
  plugins: [
    require('postcss-easy-import')({
      extensions: ['.css', '.scss'],
    }),
    require('@csstools/postcss-sass'),
    require('postcss-simple-vars'),
    require('tailwindcss')(tailwindDir),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('cssnano') : undefined,
  ].filter(x => x !== undefined)
})
