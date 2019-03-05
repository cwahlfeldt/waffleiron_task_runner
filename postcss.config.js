const fs = require('fs')
const tailwindDir = fs.existsSync('./tailwind.js') ? process.cwd() + '/tailwind.js' : __dirname + '/tailwind.js'
const defaultConfig = require(__dirname + '/waffles.default.js')
const userConfig = fs.existsSync(process.cwd() + '/waffles.config.js') ? require(process.cwd() + '/waffles.config.js')() : {}
const config = require('deepmerge')(defaultConfig(), userConfig)

module.exports = () => ({
  syntax: 'postcss-scss',
  map: process.env.NODE_ENV !== 'production',
  plugins: [
    require('postcss-import'),
    require('postcss-global-scss-vars')({
      variables: config.styleVars,
    }),
    require('@csstools/postcss-sass'),
    require('tailwindcss')(tailwindDir),
    require('@fullhuman/postcss-purgecss')({
      content: [
        `${config.viewsDir}/**/*.blade.php`,
        `${config.viewsDir}/**/*.html`,
      ],
      extractors: [
        {
          extractor: class {
            static extract(content) {
              return content.match(/[A-Za-z0-9-_:\/]+/g) || [];
            }
          },
          extensions: ["html", "js", "php"]
        }
      ],
      whitelist: require("purgecss-whitelister")([
        `${config.stylesDir}/**/*.scss`,
        `${config.stylesDir}/**/*.css`,
      ])
    }),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' ? require('cssnano') : undefined,
  ].filter(x => x !== undefined),
})
