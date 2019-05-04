import {BUILTIN_COMMANDS} from './dterm-constants.js'
import joinPath from './join-path.js'

let home = null
let env = null

export function getHome () {
  return home
}

export async function selectHome (url) {
  let archive = url ? new DatArchive(url) : await DatArchive.selectArchive({filters: {isOwner: true}})
  let {key, title} = await archive.getInfo()
  home = {archive, key, path: ''}
  document.title = title + ' - dterm'

  if (await exists(archive, 'term.json')) {
    await loadEnv()
  } else {
    await setEnv(buildEnv())
  }
  return home
}

export function getEnv () {
  if (!home) {
    throw new Error('Environment not loaded')
  }
  return env || loadEnv()
}

export async function setEnv (next) {
  if (!home) {
    throw new Error('Environment not loaded')
  }
  await home.archive.writeFile('term.json', JSON.stringify(next, null, 4))
  env = next
}

export function buildEnv (init) {
  init = init || {commands: {}, config: {}}
  let command, host = new URL(import.meta.url).host

  for (command of BUILTIN_COMMANDS) {
    if (!init.commands[command.name]) {
      init.commands[command.name] = 'dat://' + joinPath(host, 'commands', command.name + '.js')
    }
  }
  if (!init.commands.help) {
    init.commands.help = 'dat://' + joinPath(host, 'commands/help.js')
  }
  return init
}

/**
 * Private helpers
 */
async function loadEnv () {
  let term = await home.archive.readFile('term.json')
  return env = JSON.parse(term)
}

async function exists (archive, file) {
  try {
    await archive.stat(file)
    return true
  } catch (err) {
    if (err.name === 'NotFoundError') {
      return false
    }
    throw err
  }
}
