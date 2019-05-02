import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function (opts, ...args) {
  let appendFlag = opts.a || opts.append
  let dst = opts.to
  let res = args.join(' ')
  let cwd = parsePath(window.location.pathname)

  if (dst) {
    dst = opts.to.startsWith('/') ? dst : joinPath(cwd.path, dst)
    if (appendFlag) {
      let content = await cwd.archive.readFile(dst, 'utf8')
      res = content + res
    }
    await cwd.archive.writeFile(dst, res)
  } else {
    return res
  }
}
