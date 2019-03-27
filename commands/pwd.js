import parsePath from '../modules/dterm-parse-path.js'

export default function () {
  var path = '~'
  var cwd = parsePath(window.location.pathname)

  if (cwd) {
    path += `/${cwd.key}/${cwd.path}`
  }
  return path
}
