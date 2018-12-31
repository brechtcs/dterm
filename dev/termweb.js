import * as env from './env-default.js'
import hast from './vendor/hastscript-v5.0.0.js'
import hyperx from './vendor/hyperx-v2.5.0.js'
import visit from './vendor/unist-util-visit-v1.4.0.js'
import {joinPath, parseCommand, parseURL} from './util.js'

bootstrap()

/**
 * Initialisation logic:
 */
async function bootstrap () {
  var params = new URL(import.meta.url).searchParams
  var home = params.get('home') || localStorage.getItem('HOME_DAT')
  var archive = home
    ? await DatArchive.load(`dat://${home}`)
    : await DatArchive.create()

  var builtins = {
    html: hyperx(hast),
    morph: function () {},
    evalCommand: evalCommand,
    getCWD: () => parseURL(window.location.toString()),
    setCWD: dst => {
      window.location.pathname = joinPath(window.location.pathname, dst)
    }
  }

  window.env = Object.assign(builtins, env)
  window.location = new URL(archive.url)
  window.onmessage = evalCommand
  localStorage.setItem('HOME_DAT', window.location.host)

  appendOutput(archive.url)
  updatePrompt()
}

/**
 * Terminal methods:
 */
function appendError (err) {
  console.error(err)
}

function appendOutput (out) {
  if (typeof out === 'undefined') {
    console.log('Ok.')
  } else if (typeof out.toHTML === 'function') {
    var tree = out.toHTML()
    visit(tree, 'text', node => console.log(node.value))
  } else {
    console.log(out)
  }
}

async function evalCommand (msg) {
  try {
    var js, module
    var command = msg.data.toString().trim()
    var {cmd, args, opts} = parseCommand(command)

    if (cmd in env) {
      cmd = `env.${cmd}`
    } else {
      module = await import(joinPath(env.pwd(), `${cmd}.js`))
      cmd = `module.${module[args[0]] ? args.shift() : 'default'}`
    }

    args.unshift(opts) // opts always go first
    js = `${cmd}(${args.map(JSON.stringify).join(', ')})`

    var res = await eval(js)
    appendOutput(res)
  } catch (err) {
    appendError(err)
  } finally {
    updatePrompt()
  }
}

function updatePrompt () {
  window.postMessage('> ')
}
