import assert from '../modules/assert.js'
import getWorkingDir from '../modules/get-working-dir.js'
import joinPath from '../modules/join-path.js'

export default async function (opts, dst) {
  assert(dst, 'dst is required')
  var cwd = getWorkingDir(window.location.pathname)
  dst = dst.startsWith('/') ? dst : joinPath(cwd.path, dst)
  var opts = {recursive: opts.r || opts.recursive}
  await cwd.archive.rmdir(dst, opts)
}
