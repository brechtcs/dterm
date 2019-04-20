export default function (obj) {
  if (!obj || typeof obj.toHTML === 'function') {
    return undefined
  }

  if (obj[Symbol.asyncIterator]) {
    return obj[Symbol.asyncIterator]()
  } else if (obj[Symbol.iterator]) {
    return obj[Symbol.iterator]()
  } else if (typeof obj.next === 'function') {
    return obj
  }
}