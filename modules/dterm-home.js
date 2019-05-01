import {DTERM_HOME, BUILTIN_COMMANDS} from './dterm-constants.js'
import joinPath from './join-path.js'

var home = null
var env = null

export async function loadHome () {
  var url = localStorage.getItem(DTERM_HOME)

  if (url) {
    return setHome(new DatArchive(url))
  }
  var env = {commands: {}, config: {}}
  var command, host = new URL(import.meta.url).host

  for (command of BUILTIN_COMMANDS) {
    env.commands[command.name] = 'dat://' + joinPath(host, 'commands', command.name + '.js')
  }
  env.commands.help = 'dat://' + joinPath(host, 'commands/help.js')

  var archive = await DatArchive.create({
    title: 'dterm home',
    description: 'Home archive for dterm',
    type: 'dterm-home'
  })

  localStorage.setItem(DTERM_HOME, archive.url)
  await archive.writeFile('term.json', JSON.stringify(env, null, 2))
  await archive.mkdir('commands')
  return setHome(archive)
}

export function getEnv () {
  if (!home) {
    throw new Error('Environment not loaded')
  }
  return env || setEnv(home.archive)
}

export function getHome () {
  return home
}

async function setEnv (archive) {
  var term = await archive.readFile('term.json')
  env = JSON.parse(term)
  return env
}

async function setHome (archive) {
  await setEnv(archive)
  home = {
    archive,
    key: archive.url.replace(/^dat:\/\//, ''),
    path: ''
  }
  return home
}
