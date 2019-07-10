import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'

export default function (opts, location) {
  let {cwd} = window
  let entry = resolveUrl(location, cwd)
  return entry.open({raw: true})
}