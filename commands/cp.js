import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import assert from 'dat://dfurl.hashbase.io/modules/assert.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, from, to) {
  assert(from, 'Please specify a source and destination')
  assert(to, 'Please specify a destination')

  let {cwd, home} = publicState
  let src = resolveUrl(from, cwd, home)
  let dst = resolveUrl(to, cwd, home)
  let file, path

  if (!isGlob(src.path)) {
    yield copy(src, dst)
    return
  }
  for await (path of glob(src.archive, src.path)) {
    let file = parseUrl(src)
    file.path = path

    let base = path.split('/').pop()
    let target = parseUrl(dst)
    target.path = joinPath(target.path, base)

    yield copy(file, target)
  }
}

async function copy (src, dst) {
  try {
    await src.archive.copy(src.path, dst.path)
    //TODO: copy between dats
  } catch (err) {
    return err
  }
}
