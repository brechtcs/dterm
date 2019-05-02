import assert from './assert.js'
import joinPath from './join-path.js'

export default async function * walk (dat, opts) {
  opts = opts || {}

  let base = typeof opts === 'string' ? opts : opts.base
  let queue = [normalize(base)]

  while (queue.length) {
    let path = queue.shift()

    if (opts.depth) {
      let depth = path.replace(/^\//, '').split('/').length
      if (depth > opts.depth) continue
    }
    let stats = await dat.stat(path, opts.follow)

    if (stats.isDirectory()) {
      let items = await dat.readdir(path)
      let paths = items.map(item => path ? joinPath(path, item) : item)
      queue.push.apply(queue, paths)
      if (opts.dirs) yield path + '/'
    } else {
      yield path
    }
  }
}

function normalize (base) {
  if (!base || base === '.' || base === '/') {
    return ''
  }
  return base
}
