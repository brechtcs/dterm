import glob from '../modules/dat-glob.js'
import isGlob from '../vendor/is-glob-v4.0.1.js'
import joinPath from '../modules/join-path.js'
import publicState from '../modules/dterm-public-state.js'

export default async function* (opts, ...patterns) {
  opts = {recursive: opts.r || opts.recursive}
  let pattern, dir

  for (pattern of patterns) {
    let cwd = pattern.startsWith('~')
      ? publicState.home
      : publicState.cwd

    pattern = resolve(pattern, cwd)

    if (!isGlob(pattern)) {
      yield rm(cwd.archive, pattern, opts)
      continue
    }
    for await (dir of glob(cwd.archive, {pattern, dirs: true})) {
      yield rm(cwd.archive, dir, opts)
    }
  }
}

function resolve (path, cwd) {
  path = path.replace(/^~/, '')

  if (path.startsWith('/')) return path
  return joinPath(cwd.path, path)
}

async function rm (dat, dir, opts) {
  try {
    await dat.rmdir(dir, opts)
  } catch (err) {
    return err
  }
}
