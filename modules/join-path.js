import assert from './assert.js'

export default function join (...args) {
  assert(args.length, 'must pass in path arguments to join')
  let root = args[0].startsWith('/')
  let parts = args.map(split).flat().filter(empty)
  let i, next, path = root ? [''] : []

  for (i = 0; i < parts.length; i++) {
    next = parts[i]

    if (skip(next)) {
      if (next === '..') path.pop()
      continue
    }

    if (next.startsWith('/')) {
      next = next.slice(1)
    }
    if (next.endsWith('/')) {
      next = next.slice(0, -1)
    }
    path.push(next)
  }

  return path.join('/')
}

function split (arg) {
  assert(typeof arg === 'string', 'path arguments must be strings')
  return arg.split('/')
}

function empty (part) {
  return part !== ''
}

function skip (part) {
  return part === '' || part === '.' || part === '..'
}
