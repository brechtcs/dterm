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
var passed = true

export async function test () {
  var dat = await DatArchive.create({
    title: 'dat-walk test',
    prompt: false
  })
  
  var count = 0
  await dat.mkdir('subdir')
  await dat.writeFile('file.md', '')
  await dat.writeFile('subdir/another.md', '')

  for await (var file of walk(dat)) {
    check(file === 'dat.json' || file === '.datignore' || file === 'file.md' || file === 'subdir/another.md', file)
    count++
  } 
  check(count === 4, 'number of files walked')
  await DatArchive.unlink(dat.url)
  
  return passed
}

function check (res, msg) {
  if (res) {
    console.info(msg)
  } else {
    console.error(msg)
    passed = false
  }  
}