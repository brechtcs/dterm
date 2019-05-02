import glob from '../modules/dat-glob.js'
import isGlob from '../shared/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function* (opts, ...patterns) {
  opts = {recursive: opts.r || opts.recursive}
  let cwd = parsePath(window.location.pathname)
  let pattern, dir

  for (pattern of patterns) {
    pattern = pattern.startsWith('/') ? pattern : joinPath(cwd.path, pattern)

    if (!isGlob(pattern)) {
      yield rm(cwd.archive, pattern, opts)
      continue
    }
    for await (dir of glob(cwd.archive, {pattern, dirs: true})) {
      yield rm(cwd.archive, dir, opts)
    }
  }
}

async function rm (dat, dir, opts) {
  try {
    await dat.rmdir(dir, opts)
  } catch (err) {
    return err
  }
}
