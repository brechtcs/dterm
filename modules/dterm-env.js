import joinPath from './join-path.js'
import {ENV_STORAGE_KEY} from './dterm-constants.js'

export default async function () {
  return load() || await create()
}

async function create () {
  var origin = new URL(import.meta.url).origin
  var archive = new DatArchive(origin)
  var env = {
    commands: {},
    options: {}
  }

  for (var command of await archive.readdir('commands')) {
    var name = command.replace(/\.js$/, '')
    env.commands[name] = joinPath(origin, 'commands', command)
  }

  return save(env)
}

function load () {
  var saved = localStorage.getItem(ENV_STORAGE_KEY)
  if (!saved) return null

  var env = JSON.parse(saved)
  Object.freeze(env.commands)
  return env
}

function save (env) {
  //TODO: encrypt before saving to prevent tampering
  localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(env))
  return env
}
