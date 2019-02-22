#!/usr/bin/env node

// globals
const browserSync = require('browser-sync')
const fs = require('fs')
const rimraf = require('rimraf')
const program = require('commander')
const spinner = require('ora')()
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const config = fs.existsSync('./waffles.config.js') ? require('./waffles.config.js') : require(__dirname + '/waffles.default.js')

// setup commander
program
  .version('0.0.3')
  .option('-w, --watch', 'watch', {isDefault: true})
  .option('-b, --build', 'build')
  .option('-bp, --build-production', 'build production')
  .option('-e, --env <env>', 'environment')
  .parse(process.argv)

process.env.NODE_ENV = (program.env || program.build-production) && config.env === 'production' ? 'production' : 'development'

// main async function
const waffleiron = async () => {
  // build
  if (program.build) {
    console.log('Pouring batter:')
    spinner.start()
    await mkdir()
    await mkdir('./.cache', true)
    await postcssBuild()
    await typescriptBuild()
    console.log('Waffles are done (built)!')
    spinner.stop()
    process.exit(0)
  }

  // default
  console.log('Watching batter:');
  spinner.start()
  await mkdir()
  await mkdir('./.cache', true)
  await postcssBuild()
  await typescriptBuild()

  const bs = browserSync.create()
  const watcher = bs.watch([
    './index.php',
    './functions.php',
    './tailwind.js',
    './src/**/*.*',
  ])
  bs.init({
    notify: true,
    proxy: 'http://cec-6412.lndo.site',
    //logLevel: 'debug',
    plugins: ['browser-sync-logger']
  })

  spinner.stop()

  console.log('Pouring and watching batter:')
  watcher.on('change', async path => {
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id];
    })

    console.log('Pouring more batter:')
    spinner.start()
    if (path === 'tailwind.js') {
      await postcssBuild()
      spinner.stop()
      return bs.reload()
    }

    const ext = path.split('.').pop()

    switch (ext) {
      case 'php' || 'blade.php' || 'blade':
        bs.reload()
        return
      case 'css' || 'scss':
        await postcssBuild()
        bs.reload()
        return
      case 'ts' || 'js':
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
