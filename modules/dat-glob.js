import assert from './assert.js'
import depth from './glob-depth.js'
import mm from '../vendor/micromatch-v3.1.10.js'
import parent from './glob-parent.js'
import walk from './dat-walk.js'

export default function glob (dat, opts) {
  let glob, it
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

  let file, base = Array.isArray(glob) ? '' : parent(glob)
  let walkOpts = Object.assign({ base }, opts)
  if (!Array.isArray(glob)) {
    walkOpts.depth = depth(glob)
  }
  for await (file of walk(dat, walkOpts)) {
    if (mm.some(file, glob)) yield file
  }
}

async function collect (it) {
  let match
  let list = []

  for await (match of it) {
    list.push(match)
  }
  return list
}
