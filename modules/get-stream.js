export default function (output) {
  if (!output || typeof output === 'string' || typeof output.toHTML === 'function') {
    return undefined
  }

  if (output[Symbol.asyncIterator]) {
    return output[Symbol.asyncIterator]()
  } else if (output[Symbol.iterator]) {
    return output[Symbol.iterator]()
  } else if (typeof output.next === 'function') {
    return output
  }
}