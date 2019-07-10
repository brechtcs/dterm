import {ErrorElement, PreElement} from './modules/elements.js'
import {deflateNode} from './modules/dom-nodes.js'
import {parseUrl} from 'dat://dfurl.hashbase.io/modules/url.js'
import getStream from './modules/get-stream.js'
import html from './vendor/nanohtml-v1.2.4.js'
import parseCommand from './modules/parse-command.js'
import which from './commands/which.js'

let token = .62

window.addEventListener('message', function receive (msg) {
  let {data} = msg

  switch (data.type) {
    case 'prompt:eval':
      token = data.token
      window.cwd = parseUrl(data.cwd)
      window.env = data.env
      evaluate(data.cmd)
      break
    default:
      throw new Error('Unknown message type: ' + data.type)
  }
})

function done () {
  send({type: 'cmd:done', cwd: window.cwd.toString()})
}

async function evaluate (command) {
  try {
    let {cmd, args, opts} = parseCommand(command)
    let mod = await import(await which(null, cmd))
    let fn = mod[args[0]] ? mod[args.shift()] : mod.default
    let out = await fn(opts, ...args)
    let stream = getStream(out)

    if (stream) {
      iterate(stream)
    } else {
      render(out)
      done()
    }
  } catch (err) {
    render(err)
    done()
  }
}

async function iterate (it) {
  try {
    for await (let val of it) {
      render(val)
    }
  } catch (err) {
    render(err)
  } finally {
    done()
  }
}

function render (output) {
  if (output && typeof output.toHTML === 'function') {
    output = output.toHTML()
  } else if (output instanceof Error) {
    output = ErrorElement(output)
  } else {
    output = PreElement(output)
  }

  try {
    let tree = deflateNode(output)
    send({type: 'cmd:out', tree})
  } catch (err) {
    render(err)
  }
}

function send (data) {
  data.token = token
  window.parent.postMessage(data, window.location.origin)
}
