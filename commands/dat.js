import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import cd from './cd.js'
import html from '../vendor/nanohtml-v1.2.4.js'
import shortenHash from '../modules/shorten-hash.js'

export async function create (opts) {
  let dat = await DatArchive.create(opts)
  return cd(null, dat.url)
}

export async function fork (opts, url) {
  if (!url) {
    let info = await window.cwd.archive.getInfo()
    url = 'dat://' + info.key
  }
  let fork = await DatArchive.fork(url)
  return cd(null, fork.url)
}

export async function rm (opts, url) {
  url = url || window.cwd.archive.url
  await DatArchive.unlink(url)
}
