import {joinPath} from '../src/common.js';
import ls from './ls.js'

var config = {
  lsAfterCd: true
}

export default async function (opts = {}, location = '') {
  location = location.toString()

  if (location.startsWith('dat://')) {
    location = location.replace(/^dat:\//, '')
  } else if (location.startsWith('/')) {
    location = location.replace(/^\//, '/' + env.getCWD().key)
  } else if (location.startsWith('~')) {
    location = location.startsWith('~/')
      ? location.replace(/^~\//, '/')
      : '/'
  } else {
    location = joinPath(window.location.pathname, location)
  }

  await env.setCWD(location)

  if (config.lsAfterCd) {
    return ls()
  }
}
