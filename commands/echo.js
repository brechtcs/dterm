import {resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'

export default async function (opts, ...args) {
  let appendFlag = opts.a || opts.append
  let dst = opts.to
  let res = args.join(' ')

  if (dst) {
    let {cwd} = window
    let target = resolveUrl(dst, cwd)

    if (appendFlag) {
      let content = await target.archive.readFile(target.path, 'utf8')
      res = content + res
    }
    await target.archive.writeFile(target.path, res)
  } else {
    return res
  }
}
