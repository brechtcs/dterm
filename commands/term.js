import {DTERM_VERSION, DTERM_SETTINGS, DTERM_ENV} from '../modules/constants.js'
import {StrictStorage, StrictStorageError} from '../modules/strict-storage.js'
import {createSettings} from '../modules/settings.js'
import {parseUrl, resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import publicState from '../modules/public-state.js'

const storage = new StrictStorage(localStorage)

export default async function (opts = {}, path) {
  if (opts.version || opts.v) {
    return DTERM_VERSION
  }
  let location = path ? resolveUrl(path, publicState.cwd) : parseUrl(window.location.origin)
  return location.open()
}

export async function settings (opts = {}) {
  let settings = await readSettings()

  if (opts.recover) {
    let env = JSON.parse(storage.getItem(DTERM_ENV))
    settings = createSettings(env)
  }

  if (opts.file === true || opts.f === true) {
    return storage.getItem(DTERM_SETTINGS)
  } else if (opts.file === false) {
    storage.removeItem(DTERM_SETTINGS)
    return maybeReload()
  } else if (opts.file || opts.f) {
    let file = resolveUrl(opts.file || opts.f, publicState.cwd)
    if (!(await file.isDirectory())) {
      storage.setItem(DTERM_SETTINGS, file.location)
    } else {
      throw new Error('Invalid settings file: ' + file.location)
    }
    return saveSettings(settings, file)
  }

  return JSON.stringify(settings, null, 4)
}

export async function config (opts = {}) {
  let opt, settings = await readSettings()

  for (opt in opts) {
    let val = opts[opt]
    if (typeof val !== 'undefined') {
      settings.config[opt] = val
    }
  }
  return saveSettings(settings)
}

export async function install (opts, location, name) {
  let {cwd, home} = publicState
  let settings = await readSettings()
  let entry = resolveUrl(location, cwd, home)
  settings.commands[name || entry.name] = entry.location
  return saveSettings(settings)
}

export async function uninstall (opts, name) {
  let settings = await readSettings()
  delete settings.commands[name]
  return saveSettings(settings)
}

/**
 * Helper functions
 */
function maybeReload () {
  if (publicState.env.config['autorefresh-changed-settings']) {
    return window.location.reload()
  }
  return 'Settings saved. Refresh to apply changes'
}

async function readSettings () {
  try {
    let file = getSettingsFile()
    return JSON.parse(await file.read())
  } catch (err) {
    if (err instanceof StrictStorageError) {
      return createSettings()
    }
    throw err
  }
}

async function saveSettings (settings, target) {
  try {
    let file = target || getSettingsFile()
    await file.write(JSON.stringify(settings, null, 4))
    return maybeReload()
  } catch (err) {
    err.description = 'Could not save dterm settings to file'
    return err
  }
}

function getSettingsFile () {
  return resolveUrl(storage.getItem(DTERM_SETTINGS), publicState.cwd)
}