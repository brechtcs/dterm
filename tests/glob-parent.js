import parent from '../modules/glob-parent.js'

export function globParent (t) {
  let cases = [
    "parent('**/gnarf/blarf.md') === ''",
    "parent('arf/barf/gnarf.txt') === 'arf/barf/gnarf.txt'",
    "parent('arf/barf/*.txt') === 'arf/barf'",
    "parent('arf/barf/gnarf.{txt,md}') === 'arf/barf'",
    "parent('arf/**/blarf.txt') === 'arf'"
  ]

  cases.forEach(c => t.ok(eval(c), c))
  t.end()
}
