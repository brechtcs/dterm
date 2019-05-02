import relative from '../modules/relative-path.js'

export function relativePath (t) {
  var cases = [
    "relative('arf/barf/gnarf', 'arf/yarf/blarf') === '../../yarf/blarf'",
    "relative('barf/gnarf', 'arf/yarf') === '../../arf/yarf'",
    "relative('barf/gnarf/yarf', 'barf/gnarf') === '..'",
    "relative('', 'ping/pong') === 'ping/pong'"
  ]

  cases.forEach(c => t.ok(eval(c), c))
  t.end()
}