#!/usr/bin/env node

// globals
const defaultDir = __dirname + '/public';
const browserSync = require('browser-sync');
const fs = require('fs');
const rimraf = require('rimraf');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const program = require('commander')
const spinner = require('ora')()

program
  .version('0.0.1')
  .option('-w, --watch', 'watch', {isDefault: true})
  .option('-b, --build', 'build')
  .parse(process.argv)

require('dotenv').config()

const waffleiron = async () => {
  // build
  if (program.build) {
    console.log('Pouring batter:')
    spinner.start()
    await mkdir();
    await mkdir(__dirname + '/.cache', true);
    await postcssBuild();
    await typescriptBuild();
    console.log('Waffles are done (built)!')
    spinner.stop()
    process.exit(0)
  }

  // default
  console.log('Watching batter:');
  spinner.start()
  await mkdir();
  await mkdir(__dirname + '/.cache', true);
  await postcssBuild();
  await typescriptBuild();

  const bs = browserSync.create();
  const watcher = bs.watch([
    './index.php',
    './functions.php',
    './tailwind.js',
    './src/**/*.*',
  ]);
  bs.init({
    notify: true,
    proxy: 'http://cec-6412.lndo.site',
    //logLevel: 'debug',
    plugins: ['browser-sync-logger']
  });

  spinner.stop()

  console.log('init chokidar');
  watcher.on('change', async path => {
    Object.keys(require.cache).forEach(function(id) {
      if (/[\/\\]src[\/\\]/.test(id)) delete require.cache[id];
    });

    console.log('Pouring more batter:')
    spinner.start()
    if (path === 'tailwind.js') {
      await postcssBuild();
      spinner.stop()
      return bs.reload();
    }

    const ext = path.split('.').pop();

    switch (ext) {
      case 'php' || 'blade.php' || 'blade':
        bs.reload();
        return;
      case 'css' || 'scss':
        await postcssBuild();
        bs.reload();
        return;
      case 'ts' || 'js':
        await typescriptBuild();
        bs.reload();
        return;
      default:
        await postcssBuild();
        await typescriptBuild();
        bs.reload();
        return;
    }
    spiner.stop()
  });

  // build typescript
  async function typescriptBuild() {
    await exec(
      './node_modules/.bin/rollup --config',
    );
  }

  // build postcss
  async function postcssBuild() {
    await exec(
      'node_modules/.bin/postcss src/styles/index.css -o public/bundle.css',
    );
  }

  // make a directory
  async function mkdir(name = defaultDir, overwrite = true) {
    try {
      if (!fs.existsSync(name)) {
        fs.mkdirSync(name);
      } else {
        if (!overwrite) return
        rimraf.sync(name);
        fs.mkdirSync(name);
      }
    } catch (err) {
      console.error(err);
    }
  }
};

waffleiron();
