import joinPath from '../modules/join-path.js'
import publicState from '../modules/dterm-public-state.js'

export default async function (opts, ...args) {
  let appendFlag = opts.a || opts.append
  let dst = opts.to
  let res = args.join(' ')

  if (dst) {
    let cwd = dst.startsWith('~')
      ? publicState.home
      : publicState.cwd

    dst = resolve(dst, cwd)

    if (appendFlag) {
      let content = await cwd.archive.readFile(dst, 'utf8')
      res = content + res
    }
    await cwd.archive.writeFile(dst, res)
  } else {
    return res
  }
}

function resolve (path, cwd) {
  path = path.replace(/^~/, '')

  if (path.startsWith('/')) return path
  return joinPath(cwd.path, path)
}
