export default function relative (from, to) {
  let fromParts = from ? from.split('/') : []
  let toParts = to ? to.split('/') : []
  let relParts = []
  let baseCount = 0

  for (let i = 0; i < toParts.length; i++) {
    if (fromParts[i] !== toParts[i]) {
      break
    }
    baseCount++
  }
  for (let i = 0; i < fromParts.length - baseCount; i++) {
    relParts.push('..')
  }

  return relParts.concat(toParts.slice(baseCount)).join('/')
}
