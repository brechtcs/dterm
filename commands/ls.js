import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import html from '../vendor/nanohtml-v1.2.4.js'
import publicState from '../modules/public-state.js'
import shortenHash from '../modules/shorten-hash.js'

export default async function (opts = {}, location = '') {
  let {cwd, home} = publicState
  let lsDir = resolveUrl(location, cwd, home)
  let listing = await lsDir.archive.readdir(lsDir.path, {stat: true})

  return listing.sort(dirsFirst).map(entry => {
    entry.url = resolveUrl(entry.name, lsDir)
    entry.toHTML = () => listItem(entry, lsDir, opts.all || opts.a)
    return entry
  })
}

function dirsFirst (a, b) {
  if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
  if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
  return a.name.localeCompare(b.name)
}

function listItem (entry, all) {
  let url = entry.stat.isDirectory() ? entry.url.pathname : entry.url.location
  let dotfile = entry.name.startsWith('.')

  let name = entry.stat.isDirectory() ? html`<strong>${entry.name}</strong>` : entry.name
  let link = html`<a href=${url}>${name}</a>`

  if (entry.stat.isFile()) {
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  }
  return html`<div class=${dotfile ? 'text-muted' : 'text-default'}>${link}</div>`
}
