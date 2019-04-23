import assert from './assert.js'

export default function depth (pattern) {
  assert(typeof pattern === 'string', 'glob pattern must be string')
  var parts = pattern.split('/')

  if (parts.includes('**')) {
    return Infinity
  }
  return parts.length
}

/**
 * Tests
 */
export function test (t) {
  var cases = [
    "depth('arf/barf/**/*.md') === Infinity",
    "depth('arf/barf/af.{md.txt}') === 3",
    "depth('arf/barf/*.txt') === 3",
    "depth('*') === 1"
  ]

  cases.forEach(c => t.ok(eval(c), c))
}