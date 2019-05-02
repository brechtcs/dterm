import depth from '../modules/glob-depth.js'

export function globDepth (t) {
  var cases = [
    "depth('arf/barf/**/*.md') === Infinity",
    "depth('arf/barf/af.{md.txt}') === 3",
    "depth('arf/barf/*.txt') === 3",
    "depth('*') === 1"
  ]

  cases.forEach(c => t.ok(eval(c), c))
  t.end()
}