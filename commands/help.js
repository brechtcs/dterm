import html from '../shared/nanohtml-v1.2.4.js'

export const METHOD_HELP = [
  {name: 'term', description: 'Configure dterm and install commands'},
  {name: 'ls', description: 'List files in the directory'},
  {name: 'cd', description: 'Change the current directory'},
  {name: 'pwd', description: 'Fetch the current directory'},
  {name: 'echo', description: 'Output the arguments'},
  {name: 'mkdir', description: 'Make a new directory'},
  {name: 'rmdir', description: 'Remove an existing directory'},
  {name: 'mv', description: 'Move a file or folder'},
  {name: 'cp', description: 'Copy a file or folder'},
  {name: 'rm', description: 'Remove a file'},
  {name: 'clear', description: 'Clear the visible command history'},
  {name: 'exit', description: 'Close dterm window'}
]

export default function () {
  return METHOD_HELP.map(function (method) {
    method.toHTML = () => html`<div class="help-entry">
      <dt>${method.name}</dt>
      <dd>${method.description}</dd>
    </div>`

    return method
  })
}
