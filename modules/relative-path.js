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
