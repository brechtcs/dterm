import {DTERM_HOME, DTERM_VERSION, ENV_STORAGE_KEY} from '../modules/constants.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import {resolveEntry} from 'dat://dfurl.hashbase.io/modules/entry.js'
import {selectHome, saveHome, buildEnv} from '../modules/home-dat.js'
import html from '../vendor/nanohtml-v1.2.4.js'
import publicState from '../modules/public-state.js'

function success () {
  const refresh = () =>  window.location.reload()
  return html`<div>Configuration saved. <a href="#" onclick=${refresh}>Refresh terminal to apply</a></div>`
}

export default async function (opts = {}) {
  if (opts.version || opts.v) {
    return DTERM_VERSION
  }
  if (opts.home) {
    let home = opts.home === true
      ? publicState.cwd.archive.url
      : opts.home
    localStorage.setItem(DTERM_HOME, home)
  } else if (opts.home == false) {
    localStorage.setItem(DTERM_HOME, false)
  }
  return success()
}

export async function config (opts = {}) {
  let opt, env = await readEnv()

  for (opt in opts) {
    let val = opts[opt]
    if (typeof val !== 'undefined') {
      env.config[opt] = val
    }
  }
  return saveEnv(env)
}

export async function install (opts, location, name) {
  let {cwd, home} = publicState
  let env = await readEnv()
  let entry = resolveEntry(location, cwd, home)
  env.commands[name || entry.name] = entry.location
  return saveEnv(env)
}

export async function uninstall (opts, name) {
  let env = await readEnv()
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
async function readEnv () {
  let term = await publicState.home.archive.readFile('term.json')
  return JSON.parse(term)
}

async function saveEnv (env) {
  await saveHome(env)
  return success()
}