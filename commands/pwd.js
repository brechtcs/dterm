import publicState from '../modules/public-state.js'

export default function () {
  let cwd = publicState.cwd
  return `${cwd.archive.url}/${cwd.path}`
}
