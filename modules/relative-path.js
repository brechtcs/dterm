export default function relative (from, to) {
  var fromParts = from ? from.split('/') : []
  var toParts = to ? to.split('/') : []
  var relParts = []
  var baseCount = 0
  
  for (var i = 0; i < toParts.length; i++) {
    if (fromParts[i] !== toParts[i]) {
      break
    }
    baseCount++
  }
  for (var i = 0; i < fromParts.length - baseCount; i++) {
    relParts.push('..')
  }
  
  return relParts.concat(toParts.slice(baseCount)).join('/')
}

/**
 * Tests
 */
export function test (t) {
  var cases = [
    "relative('arf/barf/gnarf', 'arf/yarf/blarf') === '../../yarf/blarf'",
    "relative('barf/gnarf', 'arf/yarf') === '../../arf/yarf'",
    "relative('barf/gnarf/yarf', 'barf/gnarf') === '..'",
    "relative('', 'ping/pong') === 'ping/pong'"
  ]
  
  cases.forEach(c => t.ok(eval(c), c))
}