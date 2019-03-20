import html from './vendor/nanohtml-v1.2.4.js'
import morph from './vendor/nanomorph-v5.1.3.js'
import minimist from './vendor/minimist-v1.2.0.js'
import {importModule} from './vendor/dynamic-import-polyfill.js'
import {joinPath, parseCommand, parseURL} from './common.js'

// globals
// =

var cwd = parseCWD(window.location.pathname) // current working directory
var env // current working environment

var commandHist = {
  array: new Array(),
  insert: -1,
  cursor: -1,
  add (entry) {
    if (entry) {
      this.array.push(entry)
    }
    this.cursor = this.array.length
  },
  prevUp () {
    if (this.cursor === -1) return ''
    this.cursor = Math.max(0, this.cursor - 1)
    return this.array[this.cursor]
  },
  prevDown () {
    this.cursor = Math.min(this.array.length, this.cursor + 1)
    return this.array[this.cursor] || ''
  },
  reset () {
    this.cursor = this.array.length
  }
 }

// helper elem
const gt = () => {
  var el = html`<span></span>`
  el.innerHTML = '&gt;'
  return el
}

// start
// =

document.addEventListener('keydown', setFocus, {capture: true})
document.addEventListener('keydown', onKeyDown, {capture: true})
window.addEventListener('focus', setFocus)
updatePrompt()
importEnvironment()
appendOutput(html`<div><strong>Welcome to webterm.</strong> Type <code>help</code> if you get lost.</div>`)
setFocus()

// output
// =

function appendOutput (output, thenCWD, cmd) {
  if (typeof output === 'undefined') {
    output = 'Ok.'
  } else if (output.toHTML) {
    output = output.toHTML()
  } else if (typeof output !== 'string' && !(output instanceof Element)) {
    output = JSON.stringify(output).replace(/^"|"$/g, '')
  }

  var entry = html`<div class="entry"></div>`
  var showPrompt = !!thenCWD
  thenCWD = thenCWD || cwd

  if (showPrompt) {
    entry.appendChild(html`<div class="entry-header">//${shortenHash(thenCWD.key)}/${thenCWD.path}${gt()} ${cmd || ''}</div>`)
  }
  entry.appendChild(html`<div class="entry-content">${output}</div>`)

  document.querySelector('.output').appendChild(entry)
  window.scrollTo(0, document.body.scrollHeight)
}

function appendError (msg, err, thenCWD, cmd) {
  appendOutput(html`
    <div class="error">
      <div class="error-header">${msg}</div>
      <div class="error-stack">${err.toString()}</div>
    </div>
  `, thenCWD, cmd)
}

function clearHistory () {
  document.querySelector('.output').innerHTML = ''
}

// prompt
//

function updatePrompt () {
  var prompt = cwd
    ? `${shortenHash(cwd.key)}/${cwd.path}`
    : ''

  morph(document.querySelector('.prompt'), html`
    <div class="prompt">
      //${prompt}${gt()} <input onkeyup=${onPromptKeyUp} />
    </div>
  `)
}

function shortenHash (str = '') {
  return str.replace(/[0-9a-f]{64}/ig, v => `${v.slice(0, 6)}..${v.slice(-2)}`)
}

function setFocus () {
  document.querySelector('.prompt input').focus()
}

function onKeyDown (e) {
  if (e.code === 'KeyL' && e.ctrlKey) {
    e.preventDefault()
    clearHistory()
  } else if (e.code === 'ArrowUp') {
    e.preventDefault()
    document.querySelector('.prompt input').value = commandHist.prevUp()
  } else if (e.code === 'ArrowDown') {
    e.preventDefault()
    document.querySelector('.prompt input').value = commandHist.prevDown()
  } else if (e.code === 'Escape') {
    e.preventDefault()
    document.querySelector('.prompt input').value = ''
    commandHist.reset()
  }
}

function onPromptKeyUp (e) {
  if (e.code === 'Enter') {
    evalPrompt()
  }
}

function evalPrompt () {
  var prompt = document.querySelector('.prompt input')
  if (!prompt.value.trim()) {
    return
  }
  commandHist.add(prompt.value)
  evalCommand(prompt.value)
  prompt.value = ''
}

async function evalCommand (command) {
  try {
    var oldCWD = Object.assign({}, env.getCWD())
    var {cmd, args, opts} = parseCommand(command)
    args.unshift(opts) // opts always go first

    var module = await getCommandModule(window.location.pathname, cmd)
    var fn = `module.${module[args[0]] ? args.shift() : 'default'}`
    var js = `${fn}(${args.map(JSON.stringify).join(', ')})`
    console.log(js)

    var res = await eval(js)
    appendOutput(res, oldCWD, command)
  } catch (err) {
    console.error(err)
    appendError('Command error', err, oldCWD, command)
  }
  updatePrompt()
}

async function getCommandModule (location, cmd) {
  var isRoot = location === '/' || location === ''
  var url = isRoot
    ? new URL(import.meta.url).origin
    : 'dat:/' + location

  try {
    var command = await importModule(`${url}/commands/${cmd}.js`)
    return command
  } catch (err) {
    if (location === '/') {
      throw new Error(cmd + ': command not found')
    } else {
      var parent = location.split('/').slice(0, -1).join('/')
      return getCommandModule(parent, cmd)
    }
  }
}

// environment
// =

async function importEnvironment () {
  var wt = new URL(import.meta.url)

  document.head.append(html`<link rel="stylesheet" href="${wt.origin}/assets/theme.css" />`)
  try {
    var module = await importModule(wt.origin + '/src/env.js')
    env = Object.assign({}, module)
    for (let k in builtins) {
      Object.defineProperty(env, k, {value: builtins[k], enumerable: false})
    }
    window.env = env
    console.log('Environment', env)
  } catch (err) {
    console.error(err)
    return appendError('Failed to evaluate environment script', err, cwd)
  }
}

// current working location
// =

async function setCWD (location) {
  var newCWD = parseCWD(location)

  if (newCWD) {
    // make sure the destination exists
    let st = await newCWD.archive.stat(newCWD.path)
    if (!st.isDirectory()) {
      throw new Error('Not a directory')
    }
  }
  window.history.pushState(null, {}, location)
  cwd = newCWD
  console.log('CWD', cwd)
}

function parseCWD (location) {
  var parts = location.split('/').slice(1).reduce((acc, part) => {
    if (part === '' || part === '.') return acc
    else if (part === '..') acc.pop()
    else acc.push(part)
    return acc
  }, [])

  if (!parts.length) return null
  var key = parts.shift()
  var archive = new DatArchive('dat://' + key)
  var path = parts.join('/')

  return {archive, key, path}
}

// builtins
// =

const builtins = {
  html,
  morph,
  evalCommand,
  getCWD () {
    return cwd
  },
  setCWD
}
