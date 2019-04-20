import assert from './assert.js'

export default function join (...args) {
  assert(args.length, 'must pass in path arguments to join')
  var root = args[0].startsWith('/')
  var parts = args.map(split).flat().filter(empty)
  var i, next, path = root ? [''] : []
  
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

/**
 * Tests
 */
export function test (t) {
  var cases = [
    "join('/arf/barf', 'gnarf') === '/arf/barf/gnarf'",
    "join('/', 'yarf/gnarf') === '/yarf/gnarf'",
    "join('arf/barf', 'gnarf') === 'arf/barf/gnarf'",
    "join('arf/barf', '/gnarf') === 'arf/barf/gnarf'",
    "join('arf/barf/', '/gnarf') === 'arf/barf/gnarf'",
    "join('arf/barf', 'yarf', 'gnarf') === 'arf/barf/yarf/gnarf'",
    "join('arf', '../yarf/barf') === 'yarf/barf'",
    "join('', 'gnarf/barf') === 'gnarf/barf'"
  ]
  
  cases.forEach(c => t.ok(eval(c), c))
}
