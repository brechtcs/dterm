import {BUILTIN_COMMANDS, ENV_STORAGE_KEY} from './dterm-constants.js'
import joinPath from './join-path.js'

var env = null

export default function () {
  return env || load() || create()
}

function create () {
  var empty = {
    commands: {},
    config: {}
  }

  return save(empty)
}

function load () {
  var saved = localStorage.getItem(ENV_STORAGE_KEY)
  if (!saved) return null

  env = JSON.parse(saved)
  var command, key = new URL(import.meta.url).host

  for (command of BUILTIN_COMMANDS) {
    env.commands[command.name] = 'dat://' + joinPath(key, 'commands', command.name + '.js')
  }
  env.commands.help = 'dat://' + joinPath(key, 'commands/help.js')
  Object.freeze(env.commands)

  return env
}

function save (next) {
  localStorage.setItem(ENV_STORAGE_KEY, JSON.stringify(next))
  return load()
}
