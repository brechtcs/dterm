let archives = new Map()

export default function (pathname) {
  let parts = pathname.split('/').slice(1).reduce((acc, part) => {
    if (part === '' || part === '.') return acc
    else if (part === '..') acc.pop()
    else acc.push(part)
    return acc
  }, [])

  if (!parts.length) return null
  let key = parts.shift()
  let path = parts.join('/')
  let archive = getArchive(key)

  return {key, path, archive}
}

function getArchive (key) {
  if (archives.has(key)) {
    return archives.get(key)
  } else {
    let archive = new DatArchive('dat://' + key)
    archives.set(key, archive)
    return archive
  }
}
