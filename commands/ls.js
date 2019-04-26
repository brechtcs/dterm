import {ls as listDats} from './dat.js'
import html from '../shared/nanohtml-v1.2.4.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'
import shortenHash from '../modules/shorten-hash.js'


export default async function (opts = {}, location = '') {
  location = joinPath(window.location.pathname, location)

  if (!location) return listDats(opts)
  var cwd = parsePath(location)
  var listing = await cwd.archive.readdir(cwd.path, {stat: true})

  return listing.sort(dirsFirst).map(entry => {
    entry.toHTML = () => listItem(entry, opts.all || opts.a)
    return entry
  })
}

function dirsFirst (a, b) {
  if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
  if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
  return a.name.localeCompare(b.name)
}

function listItem (entry, all) {
  var url = 'dat:/' + joinPath(window.location.pathname, entry.name)
  var dotfile = entry.name.startsWith('.')

  var el = html`<div class=${dotfile ? 'text-muted' : 'text-default'}></div>`
  var link = html`<a href=${url} target="_blank">${shortenHash(entry.name)}</a>`
  el.appendChild(link)

  if (dotfile && !all) el.toggleAttribute('hidden')
  if (entry.stat.isDirectory()) {
    link.style.fontWeight = 'bold'
    link.addEventListener('click', function (e) {
      e.preventDefault()
      e.stopPropagation()
      window.evalCommand(`cd ${url}`)
    })
  }
  return el
}
