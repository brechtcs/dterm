import publicState from '../modules/dterm-public-state.js'

export default function () {
  let cwd = publicState.cwd
  return `${cwd.archive.url}/${cwd.path}`
}
