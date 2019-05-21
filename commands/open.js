import {resolveEntry} from 'dat://dfurl.hashbase.io/modules/entry.js'
import publicState from '../modules/public-state.js'

export default function (opts, location) {
  let {cwd, home} = publicState
  let entry = resolveEntry(location, cwd, home)
  return entry.open()
}