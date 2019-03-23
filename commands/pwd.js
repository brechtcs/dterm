import getWorkingDir from '../modules/get-working-dir.js'

export default function () {
  var path = '~'
  var cwd = getWorkingDir(window.location.pathname)

  if (cwd) {
    path += `/${cwd.key}/${cwd.path}`
  }
  return path
}
