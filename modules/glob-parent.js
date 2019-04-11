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
var passed = true

export function test () {
  check('arf/barf/gnarf.txt', 'arf/barf/gnarf.txt')
  check('**/gnarf/blarf.md', 'fail')
  check('arf/barf/*.txt', 'arf/barf')
  check('arf/**/blarf.txt', 'arf')
  check('arf/barf/gnarf.{txt,md}', 'arf/barf')
  return passed 
}

function check (input, expected) {
  var res = parent(input)
  
  if (res === expected) {
    console.info(`'${res}' === '${expected}'`)
  } else {
    passed = false
    console.error(`'${res}' !== '${expected}'`)
  }
}