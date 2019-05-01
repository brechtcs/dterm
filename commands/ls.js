import html from '../shared/nanohtml-v1.2.4.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'
import resolvePath from '../modules/dterm-resolve-path.js'
import shortenHash from '../modules/shorten-hash.js'

export default async function (opts = {}, location = '') {
  var workingDir = parsePath(window.location.pathname)
  var lsDir = parsePath(resolvePath(getHome(), workingDir, location))
  var listing = await lsDir.archive.readdir(lsDir.path, {stat: true})

  return listing.sort(dirsFirst).map(entry => {
    entry.toHTML = () => listItem(entry, lsDir, opts.all || opts.a)
    return entry
  })
}

function dirsFirst (a, b) {
  if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
  if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
  return a.name.localeCompare(b.name)
}

function listItem (entry, dir, all) {
  var url = dir.archive.url + '/' + joinPath(dir.path, entry.name)
  var dotfile = entry.name.startsWith('.')

  var el = html`<div class=${dotfile ? 'text-muted' : 'text-default'}></div>`
  var link = html`<a href=${url} target="_blank">${shortenHash(entry.name)}</a>`
  el.appendChild(link)

  if (dotfile && !all) el.setAttribute('hidden', '')
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
