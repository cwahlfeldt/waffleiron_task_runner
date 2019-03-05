#!/usr/bin/env node

// dependencies
const fs = require('fs')
const filesize = require('filesize')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const program = require('commander')
const { table } = require('table')
const browserSync = require('browser-sync')
const rimraf = require('rimraf')
const spinner = require('ora')()
const timer = require('simple-timer')
const ms = require('ms')
const proxy = require('http-proxy-middleware')
const purgecss = require('purgecss')

//
// config file if local merge both defaults and local else just default
const defaultConfig = require(__dirname + '/waffles.default.js')
const userConfig = fs.existsSync(process.cwd() + '/waffles.config.js') ? require(process.cwd() + '/waffles.config.js')() : {}
const config = require('deepmerge')(defaultConfig(), userConfig)

//
// setup commander
const pjson = require(__dirname + '/package.json')
program
  .version(pjson.version)
  .option('-w, --watch', 'watch', {isDefault: true})
  .option('-s, --source', 'source file(s)')
  .option('-b, --build', 'build')
  .option('-p, --production', 'build production')
  .option('-e, --env <env>', 'environment')
  .option('-c, --css', 'just css')
  .option('-t, --typescript', 'just typescript')
  .parse(process.argv)

//
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

const isDev = process.env.NODE_ENV === 'development'

const waffleiron = async () => {
  timer.start('timer')

  //
  // -c --css
  if (program.css) {
    console.log('Pouring batter:')
    spinner.start()
    await mkdir()
    await mkdir(config.cache)
    await postcssBuild(true)
    spinner.stop()
    timer.stop('timer')
    console.log(printBuild())
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)   
  }

  //
  // -c --css
  if (program.typescript) {
    console.log('Pouring batter:')
    spinner.start()
    await mkdir()
    await mkdir(config.cache)
    await typescriptBuild(true)
    spinner.stop()
    timer.stop('timer')
    console.log(printBuild())
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)   
  }

  //
  // -b --build
  if (program.build || program.production) {
    console.log('Pouring batter:')
    spinner.start()
    await mkdir()
    await mkdir(config.cache)
    await postcssBuild()
    await typescriptBuild()
    spinner.stop()
    timer.stop('timer')
    console.log(printBuild())
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)
  }

  //
  // default -w --watch
  console.log('Gonna watch da batter:');
  spinner.start()
  await mkdir()
  await mkdir(config.cache)
  await postcssBuild()
  await typescriptBuild()

  //
  // bs init
  const bs = browserSync.create()
  const watcher = bs.watch(config.files)
  bs.init({
    notify: true,
    server: {
      baseDir: config.baseDir,
      port: config.port,
      middleware: [
        proxy('**', {
          target: config.proxy,
          changeOrigin: true,
          logLevel: config.logLevel,
        }),
      ],
    },
  })
  spinner.stop()
  timer.stop('timer')
  console.log(printBuild())
  console.log(`Waffles were completed in ${ms(timer.get('timer').delta)}. Now watching ...`)

  //
  // watch on change
  watcher.on('change', async path => {
    timer.start('timer')
    Object.keys(require.cache).forEach(id => {
      if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id];
    })

    console.log('Pouring more batter!')
    spinner.start()
    if (path === 'tailwind.js') {
      await postcssBuild()
      spinner.stop()
      timer.stop('timer')
      console.log(`Tailwind built in ${ms(timer.get('timer').delta)}`)
      return bs.reload()
    }

    const ext = path.split('.').pop()
    switch (ext) {
      case 'php' || 'blade.php' || 'blade':
        bs.reload()
        console.log('Views built')
        return
      case 'css' || 'scss':
        await postcssBuild()
        timer.stop('timer')
        console.log(`CSS built in ${ms(timer.get('timer').delta)}`)
        bs.reload()
        return
      case 'ts' || 'js':
        await typescriptBuild()
        timer.stop('timer')
        console.log(`JS built in ${ms(timer.get('timer').delta)}`)
        bs.reload()
        return
      default:
        await postcssBuild()
        await typescriptBuild()
        timer.stop('timer')
        console.log(`CSS & JS built in ${ms(timer.get('timer').delta)}`)
        bs.reload()
        return
    }
  })

  //
  // build typescript
  async function typescriptBuild(debug) {
    const {err} = await exec(`
      ./node_modules/.bin/rollup \
        --config ${__dirname}/rollup.config.js -i ${config.scripts} \
        ${process.env.NODE_ENV !== 'production' ? '-m' : ''} \
        -o ${config.outDir}/${config.outScript} \
        -f iife
    `)
    if (debug) console.log(stdout)
    if (err) {
      console.error(err)
      process.exit(1)
    }
  }

  //
  // build postcss
  async function postcssBuild(debug) {
    const {err, stdout} = await exec(`
      ./node_modules/.bin/postcss \
        --config ${__dirname}/postcss.config.js \
        ${config.styles} \
        -o ${config.outDir}/${config.outStyle}
    `)
    if (debug) console.log(stdout)
    if (err) {
      console.error(stdout)
      process.exit(1)
    }
  }

  //
  // pretty print build as table
  function printBuild() {
    const files = fs.readdirSync(config.outDir, 'utf8')
    let outputFiles = []
    for (let name of files) {
      const size = fs.statSync(config.outDir + '/' + name).size
      outputFiles.push([name, size > 2000000 ? filesize(size) + ' *large' :  filesize(size)])
    }
    return table(outputFiles)
  }

  //
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

//
// call that sucker!
waffleiron()
