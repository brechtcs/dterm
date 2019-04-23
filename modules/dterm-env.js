import {ENV_STORAGE_KEY} from './dterm-constants.js'
import {METHOD_HELP} from '../commands/help.js'
import joinPath from './join-path.js'

var cached = null

export default function () {
  return cached || load() || create()
}

function create () {
  var origin = new URL(import.meta.url).origin
  var archive = new DatArchive(origin)
  var command, env = {
    commands: {
      help: joinPath(origin, 'commands/help.js')
    },
    config: {}
  }

  for (command of METHOD_HELP) {
    env.commands[command.name] = joinPath(origin, 'commands', command.name + '.js')
  }

  return save(env)
}

function load () {
  var saved = localStorage.getItem(ENV_STORAGE_KEY)
  if (!saved) return null

  var env = JSON.parse(saved)
  Object.freeze(env.commands)
  cached = env
  return env
}

function save (env) {
  //TODO: encrypt before saving to prevent tampering
  localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(env))
  return load()
}
