import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'

export default async function* (opts, ...dirs) {
  let {cwd} = window
  let dir = ''

  for (dir of dirs) {
    let target = resolveUrl(dir, cwd)
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
