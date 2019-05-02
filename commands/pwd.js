import parsePath from '../modules/dterm-parse-path.js'

export default function () {
  let path = '~'
  let cwd = parsePath(window.location.pathname)

  if (cwd) {
    path += `/${cwd.key}/${cwd.path}`
  }
  return path
}
