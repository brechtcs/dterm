import {findCommand} from '../modules/load-command.js'

export default async function (opts, cmd) {
  return findCommand(cmd, window.location.pathname)
}
