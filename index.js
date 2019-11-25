const path = require('path')
const findUp = require('find-up')
const spawn = require('cross-spawn-with-kill')
const getEnv = require('./lib/env')

module.exports = function initPluginElectronProcess(bundler) {
  const envFlag = getEnv('PARCEL_PLUGIN_ELECTRON_PROC')
  const opts = bundler.options

  // if we've explicitly:
  // turned off the plugin,
  // haven't forcably turned on the plugin and
  //      we aren't electron,
  //      we aren't in watch mode
  // exit
  if (
    envFlag === '0' ||
    (envFlag !== '1' && (opts.target !== 'electron' || opts.watch === false))
  ) {
    return
  }

  // where's package.json
  const rootDir = path.dirname(findUp.sync('package.json', { cwd: opts.rootDir }))

  let proc = undefined

  // bind an event for build complete (and rebuild complete)
  bundler.on('buildEnd', () => {
    // first check if an existing process for this instance of the plugin is running
    if (proc !== undefined) {
      // if it is, kill it
      proc.kill()
    }

    // spawn electron (using the calculated rootDir as arg1)
    proc = spawn('electron', [rootDir], { stdio: 'inherit' })
  })
}
