import glob from '../modules/dat-glob.js'
import isGlob from '../vendor/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function* (opts, ...patterns) {
  let cwd = parsePath(window.location.pathname)
  let pattern, file

  for (pattern of patterns) {
    pattern = pattern.startsWith('/') ? pattern : joinPath(cwd.path, pattern)

    if (!isGlob(pattern)) {
      yield rm(cwd.archive, pattern)
      continue
    }
    for await (file of glob(cwd.archive, pattern)) {
      yield rm(cwd.archive, file)
    }
  }
}

async function rm (dat, file) {
  try {
    dat.unlink(file)
  } catch (err) {
    return err
  }
}