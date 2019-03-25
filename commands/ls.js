import getWorkingDir from '../modules/get-working-dir.js'
import joinPath from '../modules/join-path.js'
import shortenHash from '../modules/shorten-hash.js'

import html from '../shared/nanohtml-v1.2.4.js'

export default async function (opts = {}, location = '') {
  location = joinPath(window.location.pathname, location)

  // if home dir, use library to populate
  if (location === '/') {
    var library = await experimental.library.list()

    library.toHTML = () => html`<div>
      ${library.map(summarizeLibraryItem).map(displayEntry)}
    </div>`

    return library
  }

  // inside archive, use directory listing
  var {archive, path} = getWorkingDir(location)
  var listing = await archive.readdir(path, {stat: true})

  // render
  listing.toHTML = () => html`<div>${listing
    .filter(filterDotfiles(opts.all || opts.a))
    .map(summarizeDirEntry)
    .sort(dirsBeforeFiles)
    .map(displayEntry)
  }</div>`

  return listing
}

function summarizeLibraryItem (item) {
  return {
    name: item.url.replace(/^dat:\/\//, ''),
    title: item.title,
    isDir: true
  }
}

function summarizeDirEntry (entry) {
  return {
    name: entry.name,
    isDir: entry.stat.isDirectory()
  }
}

function filterDotfiles (showAll) {
  return function (entry) {
    if (showAll) return true
    return entry.name.startsWith('.') === false
  }
}

function dirsBeforeFiles (a, b) {
  if (a.isDir && !b.isDir) return -1
  if (!a.isDir && b.isDir) return 1
  return a.name.localeCompare(b.name)
}

function displayEntry (entry) {
  // coloring
  var color = 'default'
  if (entry.name.startsWith('.')) {
    color = 'muted'
  }

  function onclick (e) {
    e.preventDefault()
    e.stopPropagation()
    window.evalCommand(`cd ${entry.name}`)
  }

  // render
  var url = 'dat:/' + joinPath(window.location.pathname, entry.name)
  var tag = entry.isDir ? 'strong' : 'span'
  var item = html`
    <div class="text-${color}">
      <${tag}>
        <a
          href=${url}
          onclick=${entry.isDir ? onclick : undefined}
          target="_blank"
        >${shortenHash(entry.name)}</a>
      </${tag}>
    </div>`

  if (entry.title) {
    item.appendChild(html`<small> ${entry.title}</small>`)
  }
  return item
}
