import ls from './commands/ls.js'

import loadCommand from './modules/dterm-load-command.js'
import parseCommand from './modules/parse-command.js'
import parsePath from './modules/dterm-parse-path.js'
import shortenHash from './modules/shorten-hash.js'

import html from './shared/nanohtml-v1.2.4.js'
import morph from './shared/nanomorph-v5.1.3.js'
import minimist from './shared/minimist-v1.2.0.js'

// globals
// =

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

var tabCompletion = {
  index: -1,
  menu: [], 
  complete: async function (prompt, back) {
    var parts = prompt.split(' ')
    if (parts.length < 2) return prompt
    
    var query = parts.pop()
    if (this.index < 0) {
      this.menu = (await ls()).filter(entry => entry.name.startsWith(query))
    }
    var index = back ? (this.index - 1) : (this.index + 1)
    var item = this.menu[index]
    
    if (item) {
      this.index = index
      return parts.join(' ') + ' ' + item.name + (item.isDir ? '/' : '')
    }
    return prompt
  },
  reset: function () {
    this.index = -1 
    this.menu = [] 
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
setupWindow()
appendOutput(html`<div><strong>Welcome to dterm.</strong> Type <code>help</code> if you get lost.</div>`, false)
setFocus()

// output
// =

function appendOutput (output, thenCWD, cmd) {
  if (typeof output === 'undefined') {
    output = ''
  } else if (typeof output.toHTML === 'function') {
    output = output.toHTML()
  } else if (typeof output !== 'string' && !(output instanceof Element)) {
    output = JSON.stringify(output).replace(/^"|"$/g, '')
  }

  var entry = html`<div class="entry"></div>`
  var showPrompt = thenCWD !== false
  thenCWD = thenCWD

  if (showPrompt) {
    var prompt = thenCWD ? `${shortenHash(thenCWD.key)}/${thenCWD.path}` : ''
    entry.appendChild(html`<div class="entry-header">//${prompt}${gt()} ${cmd || ''}</div>`)
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
  var cwd = parsePath(window.location.pathname)
  var prompt = cwd
    ? `${shortenHash(cwd.key)}/${cwd.path}`
    : ''

  morph(document.querySelector('.prompt'), html`
    <div class="prompt">
      //${prompt}${gt()} <input onkeyup=${onPromptKeyUp} />
    </div>
  `)
}

function setFocus () {
  document.querySelector('.prompt input').focus()
}

async function onKeyDown (e) {
  if (e.code === 'Tab') {
    var prompt = document.querySelector('.prompt input')
    prompt.value = await tabCompletion.complete(prompt.value, e.shiftKey)
  } else if (!e.shiftKey) {
    tabCompletion.reset()
  }
  
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
    var oldCWD = parsePath(window.location.pathname)
    var {cmd, args, opts} = parseCommand(command)
    var mod = await loadCommand(cmd, window.location.pathname)
    var fn = mod[args[0]] ? mod[args.shift()] : mod.default
    var res = await fn(opts, ...args)
    appendOutput(res, oldCWD, command)
  } catch (err) {
    console.error(err)
    appendError('Command error', err, oldCWD, command)
  }
  updatePrompt()
}

// environment
// =

async function setupWindow () {
  var origin = new URL(import.meta.url).origin
  document.head.append(html`<link rel="stylesheet" href="${origin}/assets/theme.css" />`)

  window.clearHistory = clearHistory
  window.evalCommand = evalCommand
}
