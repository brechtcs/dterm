import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import publicState from '../modules/public-state.js'

export default async function* (opts, ...patterns) {
  let {cwd} = publicState
  let pattern, file

  for (pattern of patterns) {
    let target = resolveUrl(pattern, cwd)

    if (!isGlob(target.path)) {
      yield read(target.archive, target.path)
      continue
    }
    for await (file of glob(target.archive, target.path)) {
      yield read(target.archive, file)
    }
  }
}

async function read (dat, file) {
  try {
    let contents = await dat.readFile(file)
    let el = document.createElement('pre')
    el.innerText = contents
    return el
  } catch (err) {
    return err
  }
}
