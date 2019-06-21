import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import publicState from '../modules/public-state.js'

import ls from './ls.js'

export default async function (opts = {}, ...args) {
  let {cwd, env} = publicState
  let location = getLocation(args)
  let version = getVersion(args)

  let next = await getNextCwd(cwd, location)
  let info = await next.archive.getInfo()
  if (version) next.version = version.replace(/^\+/, '')

  publicState.title = info.title
  publicState.cwd = next

  if (env.config['ls-after-cd']) {
    return ls()
  }
}

async function getNextCwd (prev, location) {
  let cwd = resolveUrl(location, prev)
  let stat = await cwd.archive.stat(cwd.path)

  if (!stat.isDirectory()) {
    throw new Error('Not a directory')
  }
  return cwd
}

function getLocation (args) {
  if (args.length > 1) return args[1].toString()
  return args[0] ? args[0].toString() : '/'
}

function getVersion (args) {
  if (args.length > 1) return args[0].toString()
}
