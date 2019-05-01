import {getHome, getEnv} from './dterm-home.js'
import joinPath from './join-path.js'
import parsePath from './dterm-parse-path.js'

export default async function (cmd, location) {
  return import(await findCommand(cmd, location))
}

export async function findCommand (cmd, location) {
  var installed = getEnv().commands[cmd]

  if (installed) {
    return installed
  }
  try {
    try {
      return await findInArchive(parsePath(location), cmd)
    } catch (err) {
      return await findInArchive(getHome(), cmd)
    }
  } catch (err) {
    throw new Error(cmd + ': command not found')
  }
}

async function findInArchive (cwd, cmd) {
  var path = joinPath('commands', cmd + '.js')
  var stat = await cwd.archive.stat(path)

  if (stat.isDirectory()) {
    throw new Error(getError(cmd))
  }
  return `dat://${cwd.key}/${path}`
}
