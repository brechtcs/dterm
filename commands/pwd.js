import parsePath from '../modules/dterm-parse-path.js'

export default function () {
  let cwd = parsePath(window.location.pathname)
  return `${cwd.archive.url}/${cwd.path}`
}
