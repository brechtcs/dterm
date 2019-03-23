import html from '../shared/nanohtml-v1.2.4.js'

const METHOD_HELP = [
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
  return {
    toHTML() {
      return html`<table>
        ${METHOD_HELP.map(method => html`<tr>
          <th style="text-align:left">${method.name}</th>
          <td>${method.description}</td>
        </tr>`)}
      </table>`
    }
  }
}
