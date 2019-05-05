import html from '../vendor/nanohtml-v1.2.4.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'
import publicState from '../modules/dterm-public-state.js'
import resolvePath from '../modules/dterm-resolve-path.js'
import shortenHash from '../modules/shorten-hash.js'

export default async function (opts = {}, location = '') {
  let workingDir = parsePath(window.location.pathname)
  let lsDir = parsePath(resolvePath(publicState.home, workingDir, location))
  let listing = await lsDir.archive.readdir(lsDir.path, {stat: true})

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
  let url = dir.archive.url + '/' + joinPath(dir.path, entry.name)
  let dotfile = entry.name.startsWith('.')

  let el = html`<div class=${dotfile ? 'text-muted' : 'text-default'}></div>`
  let link = html`<a href=${url} target="_blank">${shortenHash(entry.name)}</a>`
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
