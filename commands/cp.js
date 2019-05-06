import assert from '../modules/assert.js'
import glob from '../modules/dat-glob.js'
import isGlob from '../vendor/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import publicState from '../modules/dterm-public-state.js'

export default async function* (opts, src, dst) {
  assert(src, 'src is required')
  assert(dst, 'dst is required')

  let cwd = src.startsWith('~')
    ? publicState.home
    : publicState.cwd

  src = resolve(src, cwd)
  dst = resolve(dst, cwd)

  if (!isGlob(src)) {
    yield copy(cwd.archive, src, dst)
    return
  }
  for await (let file of glob(cwd.archive, src)) {
    let base = file.split('/').pop()
    yield copy(cwd.archive, file, joinPath(dst, base))
  }
}

function resolve (path, cwd) {
  path = path.replace(/^~/, '')

  if (path.startsWith('/')) return path
  return joinPath(cwd.path, path)
}

async function copy (dat, src, dst) {
  try {
    await dat.copy(src, dst)
  } catch (err) {
    return err
  }
}