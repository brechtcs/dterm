import assert from './assert.js'
import depth from './glob-depth.js'
import mm from '../shared/micromatch-v3.1.10.js'
import parent from './glob-parent.js'
import walk from './dat-walk.js'

export default function glob (dat, opts) {
  var glob, it
  if (typeof opts === 'string' || Array.isArray(opts)) {
    glob = opts
    opts = {}
  } else {
    assert(opts, 'must pass in glob pattern or opts object')
    glob = opts.pattern
  }
  it = match(dat, glob, opts)
  it.collect = () => collect(it)
  return it
}

async function* match (dat, glob, opts) {
  assert(typeof glob === 'string' || Array.isArray(glob), 'Invalid glob pattern')

  var file, base = Array.isArray(glob) ? '' : parent(glob)
  var walkOpts = Object.assign({ base }, opts)
  if (!Array.isArray(glob)) {
    walkOpts.depth = depth(glob)
  }
  for await (file of walk(dat, walkOpts)) {
    if (mm.some(file, glob)) yield file
  }
}

async function collect (it) {
  var match
  var list = []

  for await (match of it) {
    list.push(match)
  }
  return list
}

/**
 * Tests
 */
export async function test (t) {
  var key = new URL(import.meta.url).hostname
  var dat = await DatArchive.load(key)

  var indexes = await glob(dat, 'index.{html,js}').collect() 
  t.ok(indexes.includes('index.html'), 'find index.html')
  t.ok(indexes.includes('index.js'), 'find index.js')
  t.ok(indexes.length === 2, 'only two index files')

  var json = await glob(dat, '*.json').collect()
  t.ok(json.includes('dat.json'), 'find dat.json')
  t.ok(json.length === 1, 'only one json file')

  for await (var file of glob(dat, '**/*.js')) {
    t.ok(file.endsWith('.js'), 'find js: ' + file)
  }
}
