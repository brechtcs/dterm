import assert from './assert.js'
import joinPath from './join-path.js'

export default async function * walk (dat, opts) {
  opts = opts || {}

  var base = typeof opts === 'string' ? opts : opts.base
  var queue = [normalize(base)]

  while (queue.length) {
    var path = queue.shift()

    if (opts.depth) {
      var depth = path.replace(/^\//, '').split('/').length
      if (depth > opts.depth) continue
    }
    var stats = await dat.stat(path, opts.follow)

    if (stats.isDirectory()) {
      var items = await dat.readdir(path)
      var paths = items.map(item => path ? joinPath(path, item) : item)
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
