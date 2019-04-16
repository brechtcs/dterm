export default function join (...args) {
  var parts = args.map(arg => arg.split('/')).flat()
  var i, next, path = [parts.shift()]
  
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

function skip (part) {
  return part === '' || part === '.' || part === '..'
}

/**
 * Tests
 */
export function test (t) {
  var cases = [
    "join('arf/barf', 'gnarf') === 'arf/barf/gnarf'",
    "join('arf/barf', '/gnarf') === 'arf/barf/gnarf'",
    "join('arf/barf/', '/gnarf') === 'arf/barf/gnarf'",
    "join('arf/barf', 'yarf', 'gnarf') === 'arf/barf/yarf/gnarf'",
    "join('arf', '../yarf/barf') === 'yarf/barf'"
  ]
  
  cases.forEach(c => t.ok(eval(c), c))
}
