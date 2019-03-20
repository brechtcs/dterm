import joinPath from '../modules/join-path.js'
import getWorkingDir from '../modules/get-working-dir.js'
import ls from './ls.js'

var config = {
  lsAfterCd: true
}

export default async function (opts = {}, location = '') {
  location = location.toString()

  if (location.startsWith('dat://')) {
    location = location.replace(/^dat:\//, '')
  } else if (location.startsWith('/')) {
    location = location.replace(/^\//, '/' + getWorkingDir(window.location.pathname).key)
  } else if (location.startsWith('~')) {
    location = location.startsWith('~/')
      ? location.replace(/^~\//, '/')
      : '/'
  } else {
    location = joinPath(window.location.pathname, location)
  }

  await setWorkingDir(location)

  if (config.lsAfterCd) {
    return ls()
  }
}

async function setWorkingDir (location) {
  var cwd = getWorkingDir(location)

  if (cwd) {
    // make sure the destination exists
    let st = await cwd.archive.stat(cwd.path)
    if (!st.isDirectory()) {
      throw new Error('Not a directory')
    }
  }
  window.history.pushState(null, {}, location)
}
