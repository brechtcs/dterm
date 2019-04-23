import getEnv from '../modules/dterm-env.js'
import joinPath from '../modules/join-path.js'
import parsePath from '../modules/dterm-parse-path.js'

export default async function (cmd, location) {
  return import(await findCommand(cmd, location))
}

async function findCommand (cmd, location) {
  var installed = getEnv().commands[cmd]
  return installed || findInArchive(cmd, location)
}

async function findInArchive (cmd, location) {
  var path, stat, cwd = parsePath(location)

  try {
    path = joinPath('commands', cmd + '.js')
    stat = await cwd.archive.stat(path)
  } catch (err) {
    throw new Error(getError(cmd))
  }
  if (stat.isDirectory()) {
    throw new Error(getError(cmd))
  }

  return `dat://${cwd.key}/${path}`
}

function getError (cmd) {
  return cmd + ': command not found'
}
