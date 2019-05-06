import joinPath from './join-path.js'
import parsePath from './dterm-parse-path.js'

export default function (home, cwd, path) {
  if (path.startsWith('dat://')) {
    return path.replace(/^dat:\//, '')
  } else if (path.startsWith('/')) {
    return path.replace(/^\//, '/' + cwd.key)
  } else if (path.startsWith('~')) {
    return path.startsWith('~/') ? '/' + path.replace(/^~/, home.key) : `/${home.key}`
  } else {
    return joinPath('/', cwd.key, cwd.path, path)
  }
}