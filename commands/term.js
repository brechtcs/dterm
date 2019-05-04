import {DTERM_HOME, DTERM_VERSION, ENV_STORAGE_KEY} from '../modules/dterm-constants.js'
import {selectHome, getHome, getEnv, setEnv, buildEnv} from '../modules/dterm-home.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function (opts = {}) {
  if (opts.change) {
    await selectHome()
  } else if (opts.reload) {
    await selectHome(getHome().archive.url)
  } else if (opts.home === true) {
    localStorage.setItem(DTERM_HOME, getHome().archive.url)
  } else if (opts.home === false) {
    localStorage.removeItem(DTERM_HOME)
  } else if (opts.version || opts.v) {
    return DTERM_VERSION
  } else {
    return getHome().archive.url
  }
}

export function config (opts = {}) {
  let env = getEnv()
  let set = (opt, fn) => {
    let val = opts[opt]
    if (typeof val !== 'undefined') {
      env.config[opt] = fn ? fn(val) : val
    }
  }

  set('lsAfterCd', Boolean)

  return saveEnv(env)
}

export function install (opts, path, name) {
  let env = getEnv()

  if (!path.startsWith('dat://')) {
    let cwd = parsePath(window.location.pathname)
    path = 'dat://' + joinPath(cwd.key, cwd.path, path)
  }
  if (!name) {
    name = path.split('/').pop().replace(/\.js/, '')
  }
  env.commands[name] = path
  return saveEnv(env)
}

export function uninstall (opts, name) {
  let env = getEnv()
  delete env.commands[name]
  return saveEnv(env)
}

export function recover (opts = {}) {
  let stored = JSON.parse(localStorage.getItem(ENV_STORAGE_KEY))
  let env = buildEnv(stored)

  if (opts.save || opts.s) {
    return saveEnv(env)
  }
  return JSON.stringify(env, null, 4)
}

/**
 * Private helpers
 */
async function saveEnv (env) {
  await setEnv(env)
  await selectHome(getHome().archive.url)
}