export default function join (...args) {
  var left = (args.shift() || '').toString()
  var right = (args.shift() || '').toString()
  var joined = left + right

  if (left.endsWith('/') && right.startsWith('/')) {
    joined = left + right.slice(1)
  }
  if (!left.endsWith('/') && !right.startsWith('/')) {
    joined = left + '/' + right
  }
  return args.length ? join(joined, ...args) : joined
}
