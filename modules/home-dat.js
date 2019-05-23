import {BUILTIN_COMMANDS, DTERM_HOME} from './constants.js'
import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import publicState from './public-state.js'

const selectOpts = {
  title: 'Select home archive',
  filters: {isOwner: true}
}

export async function selectHome (url) {
  // load home dat
  let archive = (url === 'false' || !url) ? await DatArchive.selectArchive(selectOpts): new DatArchive(url)
  let info = await archive.getInfo()
  if (!info.isOwner) {
    throw new Error('Must be owner of home archive')
  }

  publicState.home = resolveUrl(archive.url, window.location.origin)
  if (url !== 'false') localStorage.setItem(DTERM_HOME, archive.url)

  // setup environment
  if (await exists(archive, 'term.json')) {
    let term = await archive.readFile('term.json')
    let env = JSON.parse(term)
    publicState.env = env
  } else {
    let env = buildEnv()
    await saveHome(env)
    publicState.env = env
  }
}

export async function saveHome (env) {
  if (!publicState.home) {
    throw new Error('Environment not loaded')
  }
  await publicState.home.archive.writeFile('term.json', JSON.stringify(env, null, 4))
}

export function buildEnv (env) {
  env = env || {commands: {}, config: {}}
  let command, origin = new URL(import.meta.url).origin

  for (command of BUILTIN_COMMANDS) {
    if (!env.commands[command.name]) {
      env.commands[command.name] = joinPath(origin, 'commands', command.name + '.js')
    }
  }
  if (!env.commands.help) {
    env.commands.help = joinPath(origin, 'commands/help.js')
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
