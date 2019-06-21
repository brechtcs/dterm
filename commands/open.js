import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import publicState from '../modules/public-state.js'

export default function (opts, location) {
  let {cwd} = publicState
  let entry = resolveUrl(location, cwd)
  return entry.open({raw: true})
}