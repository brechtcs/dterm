import isGlob from '../shared/is-glob-v4.0.1.js'
import joinPath from './join-path.js'

export default function parent (glob) {
  var parts = glob.split('/')
  var part, parent = ''
  
  for (part of parts) {
    if (isGlob(part)) return parent
    parent = parent
      ? joinPath(parent, part)
      : part
  }
  return parent
}

/**
 * Tests
 */
export function test (t) {
  var cases = [
    "parent('**/gnarf/blarf.md') === ''",
    "parent('arf/barf/gnarf.txt') === 'arf/barf/gnarf.txt'",
    "parent('arf/barf/*.txt') === 'arf/barf'",
    "parent('arf/barf/gnarf.{txt,md}') === 'arf/barf'",
    "parent('arf/**/blarf.txt') === 'arf'"
  ]
  
  cases.forEach(c => t.ok(eval(c), c))
}
