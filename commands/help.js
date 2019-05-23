import {BUILTIN_COMMANDS} from '../modules/constants.js'
import html from '../vendor/nanohtml-v1.2.4.js'

export default function () {
  return BUILTIN_COMMANDS.map(function (cmd) {
    cmd.toHTML = () => html`<div class="help-entry">
      <dt>${cmd.name}</dt>
      <dd>${cmd.description}</dd>
    </div>`

    return cmd
  })
}
