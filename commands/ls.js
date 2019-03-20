import getWorkingDir from '../modules/get-working-dir.js'
import joinPath from '../modules/join-path.js';

export default async function (opts = {}, location = '') {
  location = joinPath(window.location.pathname, location)

  // if home dir, use library to populate
  if (location === '/') {
    var library = await experimental.library.list()

    library.toHTML = () => env.html`<div>
      ${library.map(archive => env.html`<div>${archive.title} (${archive.url})</div>`)}
    </div>`

    return library
  }

  // inside archive, use directory listing
  var {archive, path} = getWorkingDir(location)
  var listing = await archive.readdir(path, {stat: true})

  // render
  listing.toHTML = () => env.html`<div>${listing
    .filter(entry => {
      if (opts.all || opts.a) {
        return true
      }
      return entry.name.startsWith('.') === false
    })
    .sort((a, b) => {
      // dirs on top
      if (a.stat.isDirectory() && !b.stat.isDirectory()) return -1
      if (!a.stat.isDirectory() && b.stat.isDirectory()) return 1
      return a.name.localeCompare(b.name)
    })
    .map(entry => {
      // coloring
      var color = 'default'
      if (entry.name.startsWith('.')) {
        color = 'muted'
      }

      function onclick (e) {
        e.preventDefault()
        e.stopPropagation()
        env.evalCommand(`cd ${entry.name}`)
      }

      // render
      const entryUrl = archive.url + joinPath(location, entry.name)
      const tag = entry.stat.isDirectory() ? 'strong' : 'span'
      return env.html`
        <div class="text-${color}">
          <${tag}>
            <a
              href=${entryUrl}
              onclick=${entry.stat.isDirectory() ? onclick : undefined}
              target="_blank"
            >${entry.name}</a>
          </${tag}>
        </div>`
    })
  }</div>`

  return listing
}
