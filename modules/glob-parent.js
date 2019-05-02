import isGlob from '../shared/is-glob-v4.0.1.js'
import joinPath from './join-path.js'

export default function parent (glob) {
  let parts = glob.split('/')
  let part, parent = ''

  for (part of parts) {
    if (isGlob(part)) return parent
    parent = parent
      ? joinPath(parent, part)
      : part
  }
  return parent
}
