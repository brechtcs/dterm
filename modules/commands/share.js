import assert from '../assert.js'
import cp from '../../commands/cp.js'

export default async function (opts, module, version) {
  assert(typeof module === 'string')
  assert(typeof version === 'string')
  var src = `${module}.js`
  var dst = `/shared/${module}-v${version}.js`
  return cp(null, src, dst)
}
