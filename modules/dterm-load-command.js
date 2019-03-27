import getEnv from '../modules/dterm-env.js'

export default async function (cmd, location) {
  var installed = (await getEnv()).commands[cmd]
  return installed ? import(installed) : recurseDirs(cmd, location)
}

async function recurseDirs (cmd, location) {
  var isRoot = location === '/' || location === ''
  var url = isRoot
    ? new URL(import.meta.url).origin
    : 'dat:/' + location

  try {
    return await import(`${url}/commands/${cmd}.js`)
  } catch (err) {
    if (isRoot) {
      throw new Error(cmd + ': command not found')
    } else {
      var parent = location.split('/').slice(0, -1).join('/')
      return recurseDirs(cmd, parent)
    }
  }
}
