import {joinPath} from 'dat://dfurl.hashbase.io/modules/path.js'
import publicState from './public-state.js'

export default async function (cmd) {
  return import(await findCommand(cmd))
}

export async function findCommand (cmd) {
  let {env, cwd, home} = publicState
  let installed = env.commands[cmd]

  if (installed) {
    return installed
  }
  try {
    try {
      return await findInArchive(cwd, cmd)
    } catch (err) {
      return await findInArchive(home, cmd)
    }
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
