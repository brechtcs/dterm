import {findCommand} from '../modules/dterm-load-command.js'

export default async function (opts, cmd) {
  return findCommand(cmd, window.location.pathname)
}