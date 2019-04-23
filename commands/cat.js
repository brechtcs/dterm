import glob from '../modules/dat-glob.js'
import isGlob from '../shared/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function* (opts, ...patterns) {
  var cwd = parsePath(window.location.pathname)
  var pattern, file

  for (pattern of patterns) {
    pattern = pattern.startsWith('/') ? pattern : joinPath(cwd.path, pattern)

    if (!isGlob(pattern)) {
      yield read(cwd.archive, pattern)
      continue
    }
    for await (file of glob(cwd.archive, pattern)) {
      yield read(cwd.archive, file)
    }
  }
}

async function read (dat, file) {
  try {
    return await dat.readFile(file)
  } catch (err) {
    return err
  }
}