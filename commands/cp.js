import assert from '../modules/assert.js'
import glob from '../modules/dat-glob.js'
import isGlob from '../shared/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function* (opts, src, dst) {
  assert(src, 'src is required')
  assert(dst, 'dst is required')

  var cwd = parsePath(window.location.pathname)
  src = src.startsWith('/') ? src : joinPath(cwd.path, src)
  dst = dst.startsWith('/') ? dst : joinPath(cwd.path, dst)

  if (!isGlob(src)) {
    yield copy(cwd.archive, src, dst)
    return
  }
  for await (var file of glob(cwd.archive, src)) {
    var base = file.split('/').pop()
    yield copy(cwd.archive, file, joinPath(dst, base))
  }
}

async function copy (dat, src, dst) {
  try {
    await dat.copy(src, dst)
  } catch (err) {
    return err
  }
}