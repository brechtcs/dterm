import joinPath from '../modules/join-path.js'
import publicState from '../modules/dterm-public-state.js'

export default async function* (opts, ...dirs) {
  for (let dir of dirs) {
    let cwd = dir.startsWith('~')
      ? publicState.home
      : publicState.cwd

    dir = resolve(dir, cwd)
    yield make(cwd.archive, dir)
  }
}

function resolve (path, cwd) {
  path = path.replace(/^~/, '')

  if (path.startsWith('/')) return path
  return joinPath(cwd.path, path)
}

async function make (dat, dir) {
  try {
    await dat.mkdir(dir)
  } catch (err) {
    return err
  }
}
