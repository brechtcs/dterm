import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, ...patterns) {
  let {cwd} = publicState
  let pattern, file

  for (pattern of patterns) {
    let target = resolveUrl(pattern, cwd)

    if (!isGlob(target.path)) {
      yield unlink(target.archive, target.path)
      continue
    }
    for await (file of glob(target.archive, target.path)) {
      yield unlink(target.archive, file)
    }
  }
}

async function unlink (dat, file) {
  try {
    dat.unlink(file)
  } catch (err) {
    return err
  }
}
