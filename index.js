#!/usr/bin/env node

//
// set default max listeners to 0 for weird warnings
require('events').EventEmitter.defaultMaxListeners = 0

//
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
const puppeteer = require('puppeteer')

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
  .option('-d, --debug', 'debug')
  .option('-t, --typescript', 'just typescript')
  .option('--wp', 'wordpress cli things')
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

if (program.debug) config.debug = true

const isDev = process.env.NODE_ENV === 'development'

const waffleiron = async () => {
  timer.start('timer')

  //
  // -c --css
  if (program.css) {
    console.log('Pouring batter...')
    spinner.start()
    await mkdir()
    //await mkdir(config.cache)
    await postcssBuild()
    spinner.stop()
    timer.stop('timer')
    console.log(printBuild())
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)   
  }

  //
  // -c --css
  if (program.typescript) {
    console.log('Pouring batter...')
    spinner.start()
    await mkdir()
    //await mkdir(config.cache)
    await typescriptBuild()
    spinner.stop()
    timer.stop('timer')
    console.log(printBuild())
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)   
  }

  //
  // -b --build
  if (program.build) {
    console.log('Pouring batter...')
    spinner.start()
    await mkdir()
    //await mkdir(config.cache)
    await postcssBuild()
    await typescriptBuild()
    spinner.stop()
    console.log(printBuild())
    timer.stop('timer')
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)
  }

  //
  // -b --build
  if (program.production || (program.build && program.production)) {
    console.log('Pouring batter...')
    spinner.start()
    await mkdir()
    //await mkdir(config.cache)
    await postcssBuild()
    await typescriptBuild()
    spinner.stop()
    console.log(printBuild())
    if (program.wp) {
      console.log('Prerendering cache...')
      spinner.start()
      await wpcli()
      spinner.start()
    }
    timer.stop('timer')
    console.log('Waffles were completed in ' + ms(timer.get('timer').delta))
    return process.exit(0)
  }

  //
  // default -w --watch
  console.log('Gonna watch da batter...')
  spinner.start()
  await mkdir()
  //await mkdir(config.cache)
  await postcssBuild()
  await typescriptBuild()

  //
  // bs init
  const bs = browserSync.create()
  const watcher = bs.watch(config.files)
  bs.init({
    notify: true,
    open: config.open,
    //proxy: config.proxy,
    server: {
      baseDir: config.baseDir,
      port: config.port,
      host: `localhost`,
      serveStatic: config.staticDirs,
      // serveStaticOptions: {
      //   extensions: ['html', 'php'] // pretty urls
      // },
      middleware: [
        proxy('**', {
          target: config.proxy,
          logLevel: config.logLevel,
          changeOrigin: true,
          /*pathRewrite: {
            '^/wp-content/themes/wafflesiron-theme/index.php': `/wp-content/themes/waffleiron-theme/index.php`,
          }*/
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
      if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id]
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
  async function typescriptBuild() {
    const { err, stdout } = await exec(`
      ./node_modules/.bin/rollup \
        --config ${__dirname}/rollup.config.js -i ${config.scripts} \
        ${process.env.NODE_ENV !== 'production' ? '-m' : ''} \
        -o ${config.outDir}/${config.outScript} \
        -f iife
    `)
    if (err) {
      console.error(stdout)
      return process.exit(1)
    }
    if (config.debug) console.log(stdout)
  }

  //
  // build postcss
  async function postcssBuild() {
    const {err, stdout} = await exec(`
      ./node_modules/.bin/postcss \
        --config ${__dirname}/postcss.config.js \
        ${config.styles} \
        -o ${config.outDir}/${config.outStyle}
    `)
    if (err) {
      console.error(stdout)
      return process.exit(1)
    }
    if (config.debug) console.log(stdout)
  }

  //
  // finds all wordpress public urls and headless crawls em
  // so all the cache files are remade
  async function wpcli() {
    const { err, stdout } = await exec(`
      lando wp post-type list \
        --fields=name,public \
        --format=json
    `)
    if (err) {
      console.error(stdout)
      return process.exit(1)
    }
    const postTypes = JSON.parse(stdout).filter(el => el.public)
    const wpclidata = await Promise.all(postTypes.map(async (type, i) => {
      const {err, stdout} = await wpPost(type.name)
      const data = JSON.parse(stdout)
      if (err) return console.log(stdout)
      return data.map(url => url.url)
    }))
    const urls = [].concat.apply([], wpclidata)
    const browser = await puppeteer.launch()
    const response = urls.map(async url => {
      const page = await browser.newPage()
      page.setDefaultNavigationTimeout(0)
      const resp = await page.goto(url, {waitUntil: 'domcontentloaded'})
      await page.close()
      return resp
    })
    const pages = await Promise.all(response)
    await browser.close()
    if (config.debug) {
      let content = ``
      for (let i = 0; i < pages.length; i++) {
        const resp = `${pages[i]._url}\n${pages[i]._status}`
        content += `${resp}\n\n`
      }
      //fs.writeFileSync('./cache/resp.log', content)
    }
  }

  async function wpPost(postType) {
    const { err, stdout } = await exec(`
      lando wp post list \
        --post_type=${postType} \
        --fields=url \
        --format=json
    `)
    if (err) {
      console.error(stdout)
      return process.exit(1)
    } 
    return {err, stdout}
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

  function getCircularReplacer() {
    const seen = new WeakSet()
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return
        }
        seen.add(value)
      }
      return value
    }
  }

  //
  // make a directory
  async function mkdir(
    name = './public',
    overwrite = true
  ) {
    const permissions = name.search('cache') !== -1 ? '0777' : '0755'
    try {
      if (!fs.existsSync(name)) {
        fs.mkdirSync(name)
        fs.chmodSync(name, permissions)
      } else {
        if (!overwrite) return
        rimraf.sync(name)
        fs.mkdirSync(name)
        fs.chmodSync(name, permissions)
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
