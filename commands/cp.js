import {parseEntry, resolveEntry} from 'dat://dfurl.hashbase.io/modules/entry.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import assert from 'dat://dfurl.hashbase.io/modules/assert.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, from, to) {
  assert(from, 'Please specify a source and destination')
  assert(to, 'Please specify a destination')

  let {cwd, home} = publicState
  let src = resolveEntry(from, cwd, home)
  let dst = resolveEntry(to, cwd, home)
  let file, path

  if (!isGlob(src.path)) {
    yield copy(src, dst)
    return
  } else if (await dst.isFile()) {
    throw new Error(`target '${dst.location}' is not a directory`)
  }
  for await (path of glob(src.archive, src.path)) {
    let target = parseEntry(dst)
    let file = parseEntry(src)
    file.path = path

    yield copy(file, target)
  }
}

async function copy (src, dst) {
  try {
    if (await dst.isDirectory()) {
      dst.path = joinPath(dst.path, src.base)
    }
    if (src.key === dst.key) {
      await src.archive.copy(src.path, dst.path)
    } else {
      await dst.write(await src.read())
    }
  } catch (err) {
    return err
  }
}
