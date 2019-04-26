import {BUILTIN_COMMANDS} from '../modules/dterm-constants.js'
import html from '../shared/nanohtml-v1.2.4.js'

export default function () {
  return BUILTIN_COMMANDS.map(function (cmd) {
    cmd.toHTML = () => html`<div class="help-entry">
      <dt>${cmd.name}</dt>
      <dd>${cmd.description}</dd>
    </div>`

    return cmd
  })
}
