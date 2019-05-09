import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, ...dirs) {
  let {cwd, home} = publicState
  let dir = ''

  for (dir of dirs) {
    let target = resolveUrl(dir, cwd, home)
    yield make(target)
  }
}

async function make (target) {
  try {
    await target.archive.mkdir(target.path)
  } catch (err) {
    return err
  }
}
