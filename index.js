#!/usr/bin/env node

// dependencies
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const program = require('commander')
const merge = require('deepmerge')
const browserSync = require('browser-sync')
const rimraf = require('rimraf')
const spinner = require('ora')()
const pjson = require('package.json')

const defaultConfig = require(__dirname + '/waffles.default.js')
const userConfig = fs.existsSync(process.cwd() + '/waffles.config.js') ? require(process.cwd() + '/waffles.config.js') : undefined

// config file if local merge both defaults and local else just default
const config = fs.existsSync('./waffles.config.js') ? merge(userConfig(), defaultConfig()) : defaultConfig()

// setup commander
program
  .version(pjson.version)
  .option('-w, --watch', 'watch', {isDefault: true})
  .option('-s, --source', 'source file(s)')
  .option('-b, --build', 'build')
  .option('-p, --production', 'build production')
  .option('-e, --env <env>', 'environment')
  .parse(process.argv)

// set env for build types
if (config.env === 'production') {
  process.env.NODE_ENV = 'production'
} else if (program.env === 'production') {
  process.env.NODE_ENV = 'production'
} else if (program.production) {
  process.env.NODE_ENV = 'production'
} else {
  process.env.NODE_ENV = 'development'
}

const waffleiron = async () => {
  // -b --build
  if (program.build) {
    console.log('Pouring batter:')
    spinner.start()
    await mkdir()
    await mkdir(config.cache, true)
    await postcssBuild()
    await typescriptBuild()
    console.log('Waffles are done!')
    spinner.stop()
    process.exit(0)
  }

  // default -w --watch
  console.log('Gonna watch da batter:');
  spinner.start()
  await mkdir()
  await mkdir(config.cache, true)
  await postcssBuild()
  await typescriptBuild()
  const bs = browserSync.create()
  const watcher = bs.watch(config.browsersync.files)
  bs.init(config.browsersync.init)
  spinner.stop()

  watcher.on('change', async path => {
    Object.keys(require.cache).forEach(id => {
      if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id];
    })

    console.log('Pouring more batter!')
    spinner.start()
    if (path === 'tailwind.js') {
      await postcssBuild()
      console.log('tailwind')
      spinner.stop()
      return bs.reload()
    }

    const ext = path.split('.').pop()
    switch (ext) {
      case 'php' || 'blade.php' || 'blade':
        console.log('templates <blade>')
        bs.reload()
        return
      case 'css' || 'scss':
        console.log('css oh yes oh yes')
        await postcssBuild()
        bs.reload()
        return
      case 'ts' || 'js':
        console.log('js say heeeey yes!')
        await typescriptBuild()
        bs.reload()
        return
      default:
        await postcssBuild()
        await typescriptBuild()
        bs.reload()
        return
    }
    spiner.stop()
  })

  // build typescript
  async function typescriptBuild() {
    const {err} = await exec(
      __dirname + '/node_modules/.bin/rollup --config ' + __dirname + '/rollup.config.js',
    )
    if (err) {
      console.error(err)
      process.exit(1)
    }
  }

  // build postcss
  async function postcssBuild() {
    const {err} = await exec(
      __dirname + '/node_modules/.bin/postcss --config ' + __dirname + '/postcss.config.js ./src/styles/index.css -o ./public/bundle.css',
    )
    if (err) {
      console.error(err)
      process.exit(1)
    }
  }

  // make a directory
  async function mkdir(
    name = './public',
    overwrite = true
  ) {
    try {
      if (!fs.existsSync(name)) {
        fs.mkdirSync(name)
      } else {
        if (!overwrite) return
        rimraf.sync(name)
        fs.mkdirSync(name)
      }
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  }
}

waffleiron()
