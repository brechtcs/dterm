import assert from './assert.js'

export default function depth (pattern) {
  assert(typeof pattern === 'string', 'glob pattern must be string')
  let parts = pattern.split('/')

  if (parts.includes('**')) {
    return Infinity
  }
  return parts.length
}
