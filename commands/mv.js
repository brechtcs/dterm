import {parseUrl, resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import assert from 'dat://dfurl.hashbase.io/modules/assert.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, from, to) {
  assert(from, 'Please specify a source and destination')
  assert(to, 'Please specify a destination')

  let {cwd} = publicState
  let src = resolveUrl(from, cwd)
  let dst = resolveUrl(to, cwd)
  let file, path

  if (!isGlob(src.path)) {
    yield rename(src, dst)
    return
  } else if (await dst.isFile()) {
    throw new Error(`target '${dst.location}' is not a directory`)
  }
  for await (path of glob(src.archive, src.path)) {
    let target = parseUrl(dst)
    let file = parseUrl(src)
    file.path = path

    yield rename(file, target)
  }
}

async function rename (src, dst) {
  try {
    if (await dst.isDirectory()) {
      dst.path = joinPath(dst.path, src.base)
    }
    if (src.key === dst.key) {
      await src.archive.rename(src.path, dst.path)
    } else {
      await dst.write(await src.read())
      await src.archive.unlink(src.path)
    }
  } catch (err) {
    return err
  }
}
