export const DTERM_VERSION = '0.1.0'
export const ENV_STORAGE_KEY = 'dterm-env'

export const BUILTIN_COMMANDS = [
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
  {name: 'which', description: 'Get the source URL for a given command'},
  {name: 'clear', description: 'Clear the visible command history'},
  {name: 'exit', description: 'Close dterm window'}
]