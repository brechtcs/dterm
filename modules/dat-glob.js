import assert from './assert.js'
import mm from '../shared/micromatch-v3.1.10.js'
import parent from './glob-parent.js'
import walk from './dat-walk.js'

export default function glob (dat, opts) {
  opts = opts || {}
  var glob = typeof opts === 'string' || Array.isArray(opts) ? opts : opts.pattern
  var it = match(dat, glob, opts)
  it.collect = () => collect(it)
  return it
}

async function * match (dat, glob, opts) {
  assert(typeof glob === 'string' || Array.isArray(glob), 'Invalid glob pattern')

  var base = Array.isArray(glob) ? '' : parent(glob)
  var walkOpts = Object.assign({ base }, opts)
  var file
  
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
var passed = true

export async function test () {
  var key = new URL(import.meta.url).hostname
  var dat = await DatArchive.load(key)
  
  var indexes = await glob(dat, 'index.{html,js}').collect() 
  check(indexes.includes('index.html'), 'find index.html')
  check(indexes.includes('index.js'), 'find index.js')
  check(indexes.length === 2, 'only two index files')
  
  var json = await glob(dat, '*.json').collect()
  check(json.includes('dat.json'), 'find dat.json')
  check(json.length === 1, 'only one json file')
  
  for await (var file of glob(dat, '**/*.js')) {
    check(file.endsWith('.js'), 'find js: ' + file)
  }
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