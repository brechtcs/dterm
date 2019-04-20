import control from './modules/element-controller.js'
import glob from './modules/dat-glob.js'
import getIterator from './modules/dterm-get-iterator.js'
import html from './shared/nanohtml-v1.2.4.js'
import isGlob from './shared/is-glob-v4.0.1.js'
import joinPath from './modules/join-path.js'
import loadCommand from './modules/dterm-load-command.js'
import parseCommand from './modules/parse-command.js'
import parsePath from './modules/dterm-parse-path.js'
import relativePath from './modules/relative-path.js'
import shortenHash from './modules/shorten-hash.js'

var term = control('main')
term.view(terminal)
term.use(render)
term.use(focus)
term.use(commands)
term.use(keyboard)
term.use(history)
term.use(menu)
term.use(globals)
term.use(debug)
term.render()
term.emit('focus')

/**
 * Elements
 */
function terminal (state, emit) {
  return html`<main>
    <div class="output">
      ${state.entries.map(output)}
    </div>
    ${prompt(state, emit)}
  </main>`
}

function welcome () {
  return html`<div><strong>Welcome to dterm.</strong> Type <code>help</code> if you get lost.</div>`
}

function output (entry) {
  return html`<div class="entry">
    ${command(entry)}
    ${entry.out.map(content)}
  </div>`
}

function content (out) {
  var el = html`<div class="entry-content"></div>`
  if (out instanceof Element) {
    el.appendChild(out)
  } else {
    el.innerHTML = out
  }
  return el
}

function error (err) {
  var error = html`<div class="error"></div>`
  var header = html`<div class="error-header">${err.message}</div>`
  var stack = html `<div class="error-stack"></div>`
  stack.innerHTML = err.stack

  header.addEventListener('click', function () {
    error.classList.toggle('open')
  })

  error.appendChild(header)
  error.appendChild(stack)
  return error
}

function command (entry) {
  if (typeof entry.in !== 'string') return ''
  var prompt = entry.cwd ? `/${shortenHash(entry.cwd.key)}/${entry.cwd.path}` : ''
  return  html`<div class="entry-header">~${prompt} ${entry.in}</div>`
}


function prompt (state, emit) {
  if (state.prompt === false) {
    return ''
  }
  var prompt = state.cwd ? `/${shortenHash(state.cwd.key)}/${state.cwd.path}` : ''
  var input = html`<input value=${state.prompt}>`

  input.addEventListener('keyup', function (e) {
    var action = (e.code === 'Enter')
      ? 'cmd:enter'
      : 'cmd:change'
    emit(action, input.value)
  })

  return html`<div class="prompt">
    ~${prompt} ${input}
  </div>`
}

/**
 * Stores
 */
function render (state, emitter, term) {
  emitter.on('render', function () {
    term.render()
    emitter.emit('focus')
  })
}

function focus (state, emitter) {
  emitter.on('focus', setFocus)
  document.addEventListener('keydown', setFocus, {capture: true})
  window.addEventListener('focus', setFocus)

  function setFocus () {
    setTimeout(() => {
      var prompt = document.querySelector('.prompt input')
      if (prompt) prompt.focus()
    })
  }
}

function commands (state, emitter) {
  state.cwd = parsePath(window.location.pathname)
  state.prompt = ''
  state.entries = [{
    cwd: null,
    in: null,
    out: [welcome()]
  }]

  emitter.on('cmd:change', function (cmd) {
    state.prompt = cmd
  })

  emitter.on('cmd:enter', function (cmd) {
    state.prompt = false
    state.entries.push({
      cwd: state.cwd,
      in: cmd,
      out: []
    })

    emitter.emit('render')
    emitter.emit('cmd:eval', cmd.trim())
  })

  emitter.on('cmd:eval', async function (command) {
    try {
      var {cmd, args, opts} = parseCommand(command)
      var mod = await loadCommand(cmd, window.location.pathname)
      var fn = mod[args[0]] ? mod[args.shift()] : mod.default
      var out = await fn(opts, ...args)
      var it = getIterator(out)
      var action = it ? 'cmd:stream' : 'cmd:out'
      emitter.emit(action, it || out)
    } catch (err) {
      console.error(err)
      emitter.emit('cmd:out', err)
    }
  })

  emitter.on('cmd:stream', async function (it) {
    try {
      var next, out = await it.next()

      while (true) {
        next = await it.next()
        emitter.emit('cmd:out', out.value, !next.done)
        if (next.done) break
        out = next
      }
    } catch (err) {
      console.error(err)
      emitter.emit('cmd:out', err)
    }
  })

  emitter.on('cmd:out', function (output, streaming) {
    if (typeof output === 'undefined') {
      output = ''
    } else if (output instanceof Error) {
      output = error(output)
    } else if (typeof output.toHTML === 'function') {
      output = output.toHTML()
    } else if (typeof output !== 'string' && !(output instanceof Element)) {
      output = JSON.stringify(output).replace(/^"|"$/g, '')
    }

    if (!streaming) {
      state.prompt = ''
      state.cwd = parsePath(window.location.pathname)
    }
    state.entries[state.entries.length - 1].out.push(output)
    emitter.emit('render')

    window.scrollTo(0, document.body.scrollHeight)
  })

  emitter.on('cmd:clear', function () {
    state.entries = []
    emitter.emit('render')
  })
}

function keyboard (state, emitter) {
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Tab') {
      e.preventDefault()
      emitter.emit('menu:nav', e.shiftKey)
    } else if (!e.shiftKey) {
      emitter.emit('menu:reset')
    }

    if (e.code === 'KeyL' && e.ctrlKey) {
      e.preventDefault()
      emitter.emit('cmd:clear')
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      emitter.emit('hist:up')
    } else if (e.code === 'ArrowDown') {
      e.preventDefault()
      emitter.emit('hist:down')
    } else if (e.code === 'Escape' || e.code === 'KeyC' && e.ctrlKey) {
      e.preventDefault()
      emitter.emit('hist:reset')
    }
  }, {capture: true})
}

function history (state, emitter) {
  state.history = []
  state.history.cursor = -1

  emitter.on('cmd:enter', function (cmd) {
    if (cmd) state.history.push(cmd)
    state.history.cursor = state.history.length
  })

  emitter.on('hist:up', function () {
    if (state.history.cursor === -1) return ''
    state.history.cursor = Math.max(0, state.history.cursor - 1)
    state.prompt = state.history[state.history.cursor]
    emitter.emit('render')
  })

  emitter.on('hist:down', function () {
    state.history.cursor = Math.min(state.history.length, state.history.cursor + 1)
    state.prompt = state.history[state.history.cursor] || ''
    emitter.emit('render')
  })

  emitter.on('hist:reset', function () {
    state.history.cursor = state.history.length
    state.prompt = ''
    emitter.emit('render')
  })
}

function menu (state, emitter) {
  state.menu = {cursor: -1}

  emitter.on('menu:nav', async function (back) {
    if (!state.cwd || state.prompt.indexOf(' ') < 0) {
      return
    }
    var {archive, path} = state.cwd
    var parts = state.prompt.split(' ')
    var last = parts.pop()

    if (state.menu.cursor < 0) {
      var pattern = isGlob(last) ? last : last + '*'
      var menu = await glob(archive, {
        pattern: path ? joinPath(path, pattern) : pattern,
        dirs: true
      }).collect()

      state.menu.items = menu.map(item => relativePath(path, item)).sort()
    }

    var cursor = back ? (state.menu.cursor - 1) : (state.menu.cursor + 1)
    var item = state.menu.items[cursor]

    if (item) {
      state.menu.cursor = cursor
      state.prompt = parts.join(' ') + ' ' + item
      emitter.emit('render')
    }
  })

  emitter.on('menu:reset', function () {
    state.menu = {cursor: -1}
  })
}

function globals (state, emitter) {
  window.clearHistory = function () {
    emitter.emit('cmd:clear')
  }

  window.evalCommand = function (cmd) {
    emitter.emit('cmd:enter', cmd)
  }
}

function debug () {
  window.term = term
}
