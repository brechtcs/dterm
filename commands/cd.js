import getEnv from '../modules/dterm-env.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

import ls from './ls.js'

export default async function (opts = {}, ...args) {
  var location = getLocation(args)
  var version = getVersion(args)

  if (!location && !version) {
    location = '/'
  } else if (location.startsWith('dat://')) {
    location = location.replace(/^dat:\//, '')
  } else if (location.startsWith('/')) {
    location = location.replace(/^\//, '/' + parsePath(window.location.pathname).key)
  } else if (location.startsWith('~')) {
    location = location.startsWith('~/') ? location.replace(/^~\//, '/') : '/'
  } else {
    location = joinPath(window.location.pathname, location)
  }
  if (version) {
    location = changeVersion(location, version)
  }

  await setWorkingDir(location)

  if (getEnv().config.lsAfterCd) {
    return ls()
  }
}

function getLocation (args) {
  if (args.length > 1) return args[1].toString()
  return args[0] ? args[0].toString() : ''
}

function getVersion (args) {
  if (args.length > 1) return args[0].toString()
}

function changeVersion (location, version) {
  version = version.replace(/^\+/, '')
  var parts = location.split('/')
  var key = parts[1].split('+')[0]
  parts[1] = version === 'latest' ? key : `${key}+${version}`
  return parts.join('/')
}

async function setWorkingDir (location) {
  var cwd = parsePath(location)

  if (cwd) {
    // make sure the destination exists
    let st = await cwd.archive.stat(cwd.path)
    if (!st.isDirectory()) {
      throw new Error('Not a directory')
    }
  }
  window.history.pushState(null, {}, location)
}
