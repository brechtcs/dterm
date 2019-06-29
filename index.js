import {DTERM_HISTORY} from './modules/constants.js'
import {DistributedFilesURL, parseUrl, resolveUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import {TerminalElement, ErrorElement, WelcomeElement} from './modules/elements.js'
import {createSettings, readSettings} from './modules/settings.js'
import {glob, isGlob} from 'dat://dfurl.hashbase.io/modules/glob.js'
import {href} from './vendor/nanohref-v3.1.0.js'
import {joinPath, relativePath} from 'dat://dfurl.hashbase.io/modules/path.js'
import {sanitizeNode} from './modules/dom-nodes.js'
import control from './modules/controller.js'
import getStream from './modules/get-stream.js'
import loadCommand from './modules/load-command.js'
import parseCommand from './modules/parse-command.js'

const params = new URLSearchParams(window.location.search)
const term = control('main')
term.use(init)
term.use(render)
term.use(focus)
term.use(commands)
term.use(keyboard)
term.use(history)
term.use(menu)
term.use(links)
term.use(debug)
term.view(TerminalElement)
term.mount()

/**
 * Handlers
 */
async function init (state, emitter) {
  state.prompt = false

  emitter.on('term:location', function (cwd) {
    if (cwd instanceof DistributedFilesURL) {
      window.history.pushState({}, null, cwd.pathname + window.location.search)
      window.cwd = cwd
    } else {
      throw new Error('Illegal state: invalid working directory')
    }
  })

  emitter.on('term:settings', function (env) {
    Object.freeze(env)
    Object.freeze(env.commands)
    Object.freeze(env.config)
    Object.defineProperty(window, 'env', {
      value: env,
      writable: false
    })
  })

  try {
    emitter.emit('term:settings', await readSettings())
  } catch (err) {
    emitter.emit('term:settings', createSettings())
  } finally {
    emitter.emit('render')
  }

  try {
    if (window.location.pathname === '/') {
      let filters = {isOwner: true}
      let dat = await DatArchive.selectArchive({filters})
      emitter.emit('term:location', resolveUrl(dat.url, window.location))
    } else {
      emitter.emit('term:location', parseUrl(window.location))
    }
    let info = await window.cwd.archive.getInfo()
    document.title = info.title + ' - dterm'

    state.prompt = ''
    emitter.emit('render', {focus: true})
  } catch (err) {
    err.name = 'TerminalInitError'
    emitter.emit('cmd:out', err)
  }
}

function render (state, emitter, term) {
  emitter.on('render', function (opts = {}) {
    term.render()

    if (opts.focus) {
      emitter.emit('focus')
    }
    if (opts.scroll) {
      window.scrollTo(0, document.body.scrollHeight)
    }
  })
}

function focus (state, emitter) {
  emitter.on('focus', setFocus)
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
    out: [WelcomeElement()]
  }]

  emitter.on('cmd:change', function (cmd) {
    state.prompt = cmd
  })

  emitter.on('cmd:enter', function (cmd) {
    state.prompt = false
    state.entries.push({
      cwd: window.cwd,
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
      output = ErrorElement(output)
    } else if (typeof output.toHTML === 'function') {
      output = output.toHTML()
    } else if (typeof output !== 'string' && !(output instanceof Element)) {
      output = JSON.stringify(output).replace(/^"|"$/g, '')
    }

    if (output instanceof Element) {
      output = sanitizeNode(output)
    }
    state.entries[state.entries.length - 1].out.push(output)
    emitter.emit('render', {scroll: true})
  })

  emitter.on('cmd:done', function () {
    state.prompt = state.prompt || ''
    emitter.emit('term:location', window.cwd)
    emitter.emit('render', {focus: true, scroll: true})
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
    if (e.code === 'KeyL' && e.ctrlKey) {
      e.preventDefault()
      emitter.emit('cmd:clear')
    } else if (e.code === 'ArrowUp') {
      e.preventDefault()
      emitter.emit('hist:up')
    } else if (e.code === 'ArrowDown') {
      e.preventDefault()
      emitter.emit('hist:down')
    } else if (e.code === 'Escape') {
      e.preventDefault()
      emitter.emit('hist:reset')
    } else if (!isModifier(e)) {
      emitter.emit('focus')
    }
  }, {capture: true})

  function isModifier (e) {
    return e.altKey || e.ctrlKey || e.metaKey || e.shiftKey
  }
}

function history (state, emitter) {
  state.history = readHistory() || []
  state.history.cursor = state.history.length || -1

  emitter.on('cmd:enter', function (cmd) {
    let last = state.history[state.history.length - 1]

    if (cmd && cmd !== last) {
      state.history.push(cmd)
      storeHistory()
    }
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

  function readHistory () {
    return JSON.parse(sessionStorage.getItem(DTERM_HISTORY))
  }

  function storeHistory () {
    let hist = JSON.stringify(state.history.slice(-12))
    return sessionStorage.setItem(DTERM_HISTORY, hist)
  }
}

function menu (state, emitter) {
  state.menu = {cursor: -1}

  emitter.on('menu:nav', async function (opts = {}) {
    if (!window.cwd || state.prompt.indexOf(' ') < 0) {
      return
    }
    let {archive, path} = window.cwd
    let parts = state.prompt.split(' ')
    let last = parts.pop()
    let pattern = isGlob(last) ? last : last + '*'

    if (state.menu.cursor < 0) {
      let menu = await glob(archive, {
        pattern: path ? joinPath(path, pattern) : pattern,
        dirs: true
      }).collect()

      state.menu.items = menu.map(item => relativePath(path, item)).sort()
    }

    let cursor = opts.back ? (state.menu.cursor - 1) : (state.menu.cursor + 1)
    let item = state.menu.items[cursor]

    if (item) {
      state.menu.cursor = cursor
      state.prompt = parts.join(' ') + ' ' + item
      emitter.emit('render')
    }
  })

  emitter.on('cmd:change', function () {
    state.menu = {cursor: -1}
  })
}

function links (state, emitter) {
  href(function (anchor) {
    let target = parseUrl(anchor)
    emitter.emit('cmd:enter', 'cd ' + target.location)
  })
}

function debug (state, emitter) {
  if (!params.get('debug')) return

  emitter.on('*', function (name, ...args) {
    console.groupCollapsed(name)
    console.warn('Trace')
    args.forEach(console.dir)
    console.groupEnd()
  })

  window.term = term
}
