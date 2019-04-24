import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'
import shortenHash from '../modules/shorten-hash.js'

import html from '../shared/nanohtml-v1.2.4.js'

export default async function (opts = {}, location = '') {
  location = joinPath(window.location.pathname, location)

  var cwd = parsePath(location)
  var entry, listing = await cwd.archive.readdir(cwd.path, {stat: true})

  return listing.sort(order).map(entry => {
    entry.toHTML = renderer(entry, opts.all || opts.a)
    return entry
  })
}

function order (a, b) {
  if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
  if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
  return a.name.localeCompare(b.name)
}

function renderer (entry, all) {
  return function () {
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
        window.evalCommand(`cd ${entry.name}`)
      })
    }
    return el
  }
}
