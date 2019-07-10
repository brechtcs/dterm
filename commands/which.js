import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'

export default async function (opts, cmd) {
  let {env, cwd} = window
  let installed = env.commands[cmd]

  if (installed) {
    return installed
  }
  try {
    return await findInArchive(cwd, cmd)
  } catch (err) {
    throw new Error(cmd + ': command not found')
  }
}

async function findInArchive (cwd, cmd) {
  let path = joinPath('commands', cmd + '.js')
  let stat = await cwd.archive.stat(path)

  if (stat.isDirectory()) {
    throw new Error(cmd + ': command not found')
  }
  return `dat://${cwd.key}/${path}`
}
