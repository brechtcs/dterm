import joinPath from './join-path.js'
import publicState from './dterm-public-state.js'

export default async function (cmd, location) {
  return import(await findCommand(cmd, location))
}

export async function findCommand (cmd, location) {
  let installed = publicState.env.commands[cmd]

  if (installed) {
    return installed
  }
  try {
    try {
      return await findInArchive(publicState.cwd, cmd)
    } catch (err) {
      return await findInArchive(publicState.home, cmd)
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
