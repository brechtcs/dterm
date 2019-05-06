import {BUILTIN_COMMANDS} from './dterm-constants.js'
import publicState from './dterm-public-state.js'
import joinPath from './join-path.js'

const selectOpts = {
  title: 'Select home archive',
  filters: {isOwner: true}
}

export async function selectHome (url) {
  let archive = url ? new DatArchive(url) : await DatArchive.selectArchive(selectOpts)
  let {key, title} = await archive.getInfo()

  publicState.home = {archive, key, path: ''}
  document.title = title + ' - dterm'

  if (await exists(archive, 'term.json')) {
    let term = await archive.readFile('term.json')
    publicState.env = JSON.parse(term)
  } else {
    await saveHome(buildEnv())
  }
}

export async function saveHome (env) {
  if (!publicState.home) {
    throw new Error('Environment not loaded')
  }
  await publicState.home.archive.writeFile('term.json', JSON.stringify(env, null, 4))
  publicState.env = env
}

export function buildEnv (env) {
  env = env || {commands: {}, config: {}}
  let command, host = new URL(import.meta.url).host

  for (command of BUILTIN_COMMANDS) {
    if (!env.commands[command.name]) {
      env.commands[command.name] = 'dat://' + joinPath(host, 'commands', command.name + '.js')
    }
  }
  if (!env.commands.help) {
    env.commands.help = 'dat://' + joinPath(host, 'commands/help.js')
  }

  if (typeof env.config.lsAfterCd !== 'undefined') {
    env.config['ls-after-cd'] = env.config.lsAfterCd
    delete env.config.lsAfterCd
  }
  return env
}

/**
 * Private helpers
 */
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
