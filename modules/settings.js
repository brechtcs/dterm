import {BUILTIN_COMMANDS, DTERM_HOME, DTERM_SETTINGS} from './constants.js'
import {StrictStorage} from './strict-storage.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'

const storage = new StrictStorage(localStorage)

export async function readSettings () {
  let url = getSettingsUrl()
  let file = resolveUrl(url, window.location)
  return JSON.parse(await file.read())
}

export function createSettings (settings) {
  settings = settings || {commands: {}, config: {}}

  for (let command of BUILTIN_COMMANDS) {
    if (!settings.commands[command.name]) {
      settings.commands[command.name] = joinPath('/commands', command.name + '.js')
    }
  }
  if (!settings.commands.help) {
    settings.commands.help = '/commands/help.js'
  }

  if (typeof settings.config.lsAfterCd !== 'undefined') {
    settings.config['ls-after-cd'] = settings.config.lsAfterCd
    delete settings.config.lsAfterCd
  }
  return settings
}

function getSettingsUrl () {
  try {
    return storage.getItem(DTERM_SETTINGS)
  } catch (err) {
    // migrate v0.2 home-dat setting
    let home = storage.getItem(DTERM_HOME)
    let url = joinPath(home, 'term.json')
    storage.setItem(DTERM_SETTINGS, url)
    storage.removeItem(DTERM_HOME)
    return url
  }
}