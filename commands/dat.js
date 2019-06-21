import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import cd from './cd.js'
import html from '../vendor/nanohtml-v1.2.4.js'
import publicState from '../modules/public-state.js'
import shortenHash from '../modules/shorten-hash.js'

export async function create (opts) {
  let dat = await DatArchive.create(opts)
  return cd(null, dat.url)
}

export async function fork (opts, url) {
  if (!url) {
    let cwd = publicState.cwd
    let info = await cwd.archive.getInfo()
    url = 'dat://' + info.key
  }
  let fork = await DatArchive.fork(url)
  return cd(null, fork.url)
}

export async function add (opts, url) {
  if (!url) {
    let cwd = publicState.cwd
    let info = await cwd.archive.getInfo()
    url = 'dat://' + info.key
  }
  await experimental.library.add(url, opts)
}

export async function rm (opts, url) {
  if (!url) {
    let dat = await DatArchive.selectArchive()
    url = dat.url
  }
  await experimental.library.remove(url)
}

export async function ls (opts = {}) {
  let saved = opts.saved || opts.s
  let list = await experimental.library.list({
    isSaved: saved === undefined ? true : saved,
    isNetworked: opts.networked || opts.n,
    isOwner: opts.owner || opts.o
  })

  return list.map(item => {
    item.toHTML = () => archiveInfo(item)
    return item
  })
}

function archiveInfo (item) {
  let url = resolveUrl(item.url, window.location.origin)
  let hash = new URL(item.url).host
  let el = html`<div class="text-default"></div>`
  let link = html`<a href=${url.pathname}>${shortenHash(hash)}</a>`
  el.appendChild(link)

  if (item.title || item.description) {
    el.appendChild(html`<small> (${item.title || item.description})</small>`)
  }
  return el
}