import {DTERM_HOME} from './modules/dterm-constants.js'
import {terminal, error, welcome} from './modules/dterm-elements.js'
import {selectHome} from './modules/dterm-home.js'
import control from './modules/dterm-controller.js'
import glob from './modules/dat-glob.js'
import getStream from './modules/dterm-stream.js'
import isGlob from './vendor/is-glob-v4.0.1.js'
import joinPath from './modules/join-path.js'
import loadCommand from './modules/dterm-load-command.js'
import parseCommand from './modules/parse-command.js'
import parsePath from './modules/dterm-parse-path.js'
import publicState from './modules/dterm-public-state.js'
import relativePath from './modules/relative-path.js'

let term = control('main')
term.view(terminal)
term.use(dterm)
term.use(render)
term.use(focus)
term.use(commands)
term.use(keyboard)
term.use(history)
term.use(menu)
term.use(debug)
term.mount()

/**
 * Handlers
 */
async function dterm (state, emitter) {
  state.public = publicState

  try {
    await selectHome(localStorage.getItem(DTERM_HOME))
    state.public.cwd = parsePath(window.location.pathname)
    state.public.prompt = ''

    emitter.emit('render')
    emitter.emit('focus')
  } catch (err) {
    emitter.emit('cmd:out', err, true)
  }
}

function render (state, emitter, term) {
  emitter.on('render', function (scroll) {
    term.render()
    emitter.emit('focus')

    if (scroll) {
      window.scrollTo(0, document.body.scrollHeight)
    }
  })
}

function focus (state, emitter) {
  emitter.on('focus', setFocus)
  document.addEventListener('keydown', setFocus, {capture: true})
  window.addEventListener('focus', setFocus)

  function setFocus () {
    let prompt = document.querySelector('.prompt .interactive')
    if (prompt) prompt.focus()
  }
}

function commands (state, emitter) {
  state.entries = [{
    cwd: null,
    in: null,
    out: [welcome()]
  }]

  emitter.on('cmd:change', function (cmd) {
    state.public.prompt = cmd
  })

  emitter.on('cmd:enter', function (cmd) {
    state.public.prompt = false
    state.entries.push({
      cwd: state.public.cwd,
      in: cmd,
      out: []
    })

    emitter.emit('render')
    emitter.emit('cmd:eval', cmd.trim())
  })

  emitter.on('cmd:eval', async function (command) {
    try {
      let {cmd, args, opts} = parseCommand(command)
      let mod = await loadCommand(cmd, window.location.pathname)
      let fn = mod[args[0]] ? mod[args.shift()] : mod.default
      let out = await fn(opts, ...args)
      let stream = getStream(out)
      let action = stream ? 'cmd:stream' : 'cmd:out'
      emitter.emit(action, stream || out)
      if (stream) return
      emitter.emit('cmd:done')
    } catch (err) {
      console.error(err)
      emitter.emit('cmd:out', err)
      emitter.emit('cmd:done')
    }
  })

  emitter.on('cmd:stream', async function (it) {
    try {
      for await (let val of it) {
        emitter.emit('cmd:out', val)
      }
    } catch (err) {
      console.error(err)
      emitter.emit('cmd:out', err)
    } finally {
      emitter.emit('cmd:done')
    }
  })

  emitter.on('cmd:out', function (output) {
    if (typeof output === 'undefined') {
      output = ''
    } else if (output instanceof Error) {
      output = error(output)
    } else if (typeof output.toHTML === 'function') {
      output = output.toHTML()
    } else if (typeof output !== 'string' && !(output instanceof Element)) {
      output = JSON.stringify(output).replace(/^"|"$/g, '')
    }

    state.entries[state.entries.length - 1].out.push(output)
    emitter.emit('render', true)
  })

  emitter.on('cmd:done', function () {
    state.public.prompt = state.public.prompt || ''
    state.public.cwd = parsePath(window.location.pathname)
    emitter.emit('render', true)
  })

  emitter.on('cmd:clear', function () {
    state.entries = []
    emitter.emit('render')
  })

  window.clearHistory = function () {
    emitter.emit('cmd:clear')
  }

  window.evalCommand = function (cmd) {
    emitter.emit('cmd:enter', cmd)
  }
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
    state.public.prompt = state.history[state.history.cursor]
    emitter.emit('render')
  })

  emitter.on('hist:down', function () {
    state.history.cursor = Math.min(state.history.length, state.history.cursor + 1)
    state.public.prompt = state.history[state.history.cursor] || ''
    emitter.emit('render')
  })

  emitter.on('hist:reset', function () {
    state.history.cursor = state.history.length
    state.public.prompt = ''
    emitter.emit('render')
  })
}

function menu (state, emitter) {
  state.menu = {cursor: -1}

  emitter.on('menu:nav', async function (back) {
    if (!state.public.cwd || state.public.prompt.indexOf(' ') < 0) {
      return
    }
    let {archive, path} = state.public.cwd
    let parts = state.public.prompt.split(' ')
    let last = parts.pop()
    let pattern = isGlob(last) ? last : last + '*'

    if (last.startsWith('~')) {
      archive = state.public.home.archive
      path = state.public.home.path
      pattern = pattern.slice(1).replace(/^\//, '')
    }

    if (state.menu.cursor < 0) {
      let menu = await glob(archive, {
        pattern: path ? joinPath(path, pattern) : pattern,
        dirs: true
      }).collect()

      state.menu.items = menu.map(item => relativePath(path, item)).sort()
    }

    let cursor = back ? (state.menu.cursor - 1) : (state.menu.cursor + 1)
    let item = state.menu.items[cursor]

    if (item) {
      item = last.startsWith('~') ? '~/' + item : item
      state.menu.cursor = cursor
      state.public.prompt = parts.join(' ') + ' ' + item
      emitter.emit('render')
    }
  })

  emitter.on('menu:reset', function () {
    state.menu = {cursor: -1}
  })
}

function debug () {
  window.term = term
}
