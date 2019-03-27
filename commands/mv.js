import assert from '../modules/assert.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function (opts, src, dst) {
  assert(src, 'src is required')
  assert(dst, 'dst is required')
  var cwd = parsePath(window.location.pathname)
  src = src.startsWith('/') ? src : joinPath(cwd.path, src)
  dst = dst.startsWith('/') ? dst : joinPath(cwd.path, dst)
  await cwd.archive.rename(src, dst)
}
