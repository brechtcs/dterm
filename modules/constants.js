export const DTERM_VERSION = '0.2.0'
export const DTERM_HOME = 'dterm-home'
export const ENV_STORAGE_KEY = 'dterm-env'

export const BUILTIN_COMMANDS = [
  {name: 'dat', description: 'Create, remove, and manage dats'},
  {name: 'term', description: 'Configure dterm and install commands'},
  {name: 'ls', description: 'List files in the directory'},
  {name: 'cd', description: 'Change the current directory'},
  {name: 'pwd', description: 'Fetch the current directory'},
  {name: 'echo', description: 'Output the arguments'},
  {name: 'cat', description: 'Output the contents of one or more files'},
  {name: 'mkdir', description: 'Make a new directory'},
  {name: 'rmdir', description: 'Remove existing directories'},
  {name: 'mv', description: 'Move files or folders'},
  {name: 'cp', description: 'Copy files or folders'},
  {name: 'rm', description: 'Remove files'},
  {name: 'which', description: 'Get the source URL for a given command'},
  {name: 'clear', description: 'Clear the visible command history'},
  {name: 'exit', description: 'Close dterm window'}
]
