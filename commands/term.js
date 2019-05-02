import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'
import {DTERM_VERSION, ENV_STORAGE_KEY} from '../modules/dterm-constants.js'

export function version () {
  return `current version: v${DTERM_VERSION}`
}

export function config (opts) {
  let env = loadEnv()
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
  let env = loadEnv()

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
  let env = loadEnv()
  delete env.commands[name]
  return saveEnv(env)
}

export function reset () {
  localStorage.removeItem(ENV_STORAGE_KEY)
}

function loadEnv() {
  return JSON.parse(localStorage.getItem(ENV_STORAGE_KEY))
}

function saveEnv(env) {
  localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(env))
  return `New settings saved. Refresh dterm to load them.`
}
