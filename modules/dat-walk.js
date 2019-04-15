import assert from './assert.js'
import joinPath from './join-path.js'

export default async function * walk (dat, opts) {
  opts = opts || {}
  
  var base = typeof opts === 'string' ? opts : opts.base
  var queue = [normalize(base)]

  while (queue.length) {
    var path = queue.shift()
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

/**
 * Tests
 */
export async function test (t) {
  var key = new URL(import.meta.url).hostname
  var dat = await DatArchive.load(key)
  var file, walked = []
  
  for await (file of walk(dat)) {
    t.ok(await dat.stat(file), 'walked: ' + file)
    walked.push(file)
  }
  
  t.ok(walked.includes('dat.json'), 'includes dat.json')
  t.ok(walked.includes('modules/dat-walk.js'), 'includes modules/dat-walk.js')
}