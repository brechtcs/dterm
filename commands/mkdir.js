import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function* (opts, ...dirs) {
  let dir, cwd = parsePath(window.location.pathname)

  for (dir of dirs) {
    dir = dir.startsWith('/') ? dir : joinPath(cwd.path, dir)
    yield make(cwd.archive, dir)
  }
}

async function make (dat, dir) {
  try {
    await dat.mkdir(dir)
  } catch (err) {
    return err
  }
}
