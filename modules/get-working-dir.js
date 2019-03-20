var archives = new Map()

export default function (pathname) {
  var parts = pathname.split('/').slice(1).reduce((acc, part) => {
    if (part === '' || part === '.') return acc
    else if (part === '..') acc.pop()
    else acc.push(part)
    return acc
  }, [])

  if (!parts.length) return null
  var key = parts.shift()
  var path = parts.join('/')
  var archive = getArchive(key)

  return {key, path, archive}
}

function getArchive (key) {
  if (archives.has(key)) {
    return archives.get(key)
  } else {
    var archive = new DatArchive('dat://' + key)
    archives.set(key, archive)
    return archive
  }
}
