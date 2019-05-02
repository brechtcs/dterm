import join from '../modules/join-path.js'

export function joinPath (t) {
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
  t.end()
}