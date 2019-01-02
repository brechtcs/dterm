import minimist from './vendor/minimist-v1.2.0.js'

export function joinPath (left, right) {
  left = (left || '').toString()
  right = (right || '').toString()
  if (left.endsWith('/') && right.startsWith('/')) {
    return left + right.slice(1)
  }
  if (!left.endsWith('/') && !right.startsWith('/')) {
    return left + '/' + right
  }
  return left + right
}

export function parseCommand (str) {
  var parts = splitParts(str)
  var cmd = parts.shift()

  var opts = minimist(parts)
  var args = opts._
  delete opts._

  return {cmd, args, opts}
}

function splitParts (str) {
  return str.split('"').map((p, i) => {
    if (i % 2) return p
    return p.trim().split(' ')
  }).reduce((acc, p, i) => {
    if (i % 2) {
      var last = acc[acc.length - 1]
      if (/\=$/.test(last)) acc[acc.length - 1] += p
      else acc.push(p)
    } else {
      acc.push.apply(acc, p)
    }
    return acc
  }, []).filter(p => p !== '')
}

export function parseURL (url) {
  if (!url.startsWith('dat://')) url = 'dat://' + url
  let urlp = new URL(url)
  let archive = new DatArchive(urlp.hostname)
  return {url, host: urlp.hostname, pathname: urlp.pathname || '/', archive}
}
