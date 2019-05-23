import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, ...patterns) {
  opts = {recursive: opts.r || opts.recursive}

  let {cwd, home} = publicState
  let pattern, dir

  for (pattern of patterns) {
    let target = resolveUrl(pattern, cwd, home)

    if (!isGlob(target.path)) {
      yield rm(target.archive, target.path, opts)
      continue
    }
    for await (dir of glob(target.archive, {pattern: target.path, dirs: true})) {
      yield rm(target.archive, dir, opts)
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
