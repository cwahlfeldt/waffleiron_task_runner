module.exports = () => ({
  plugins: [
    require('postcss-easy-import'),
    require('postcss-simple-vars'),
    require('@csstools/postcss-sass'),
    require('tailwindcss')(__dirname + '/tailwind.js'),
    require('autoprefixer'),
    require('cssnano'),
  ]
})
