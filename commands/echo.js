import getWorkingDir from '../modules/get-working-dir.js'
import joinPath from '../modules/join-path.js'

export default async function (opts, ...args) {
  var appendFlag = opts.a || opts.append
  var dst = opts.to
  var res = args.join(' ')
  var cwd = getWorkingDir(window.location.pathname)

  if (dst) {
    dst = opts.to.startsWith('/') ? dst : joinPath(cwd.path, dst)
    if (appendFlag) {
      var content = await cwd.archive.readFile(dst, 'utf8')
      res = content + res
    }
    await cwd.archive.writeFile(dst, res)
  } else {
    return res
  }
}
