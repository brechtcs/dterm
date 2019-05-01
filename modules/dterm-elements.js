import html from '../shared/nanohtml-v1.2.4.js'
import shortenHash from './shorten-hash.js'

export function terminal (state, emit) {
  return html`<main>
    <div class="output">
      ${state.entries.map(output)}
    </div>
    ${prompt(state.cwd, state.prompt, emit)}
  </main>`
}

export function error (err) {
  var el = html`<div class="error"></div>`
  var header = html`<div class="error-header">${err.message}</div>`
  var stack = html `<div class="error-stack"></div>`
  stack.innerHTML = err.stack

  header.addEventListener('click', function () {
    el.classList.toggle('open')
  })

  el.appendChild(header)
  el.appendChild(stack)
  return el
}

export function prompt (cwd, value, emit) {
  var interactive = !!emit
  var prompt = cwd ? `/${shortenHash(cwd.key)}/${cwd.path}` : ''
  var input = html`<input value=${value || ''} disabled>`
  var el = html`<div class="prompt">~${prompt} ${input}</div>`

  if (value === false) el.toggleAttribute('hidden')
  if (!interactive) return el

  input.classList.add('interactive')
  input.toggleAttribute('disabled')
  input.addEventListener('keyup', function (e) {
    var action = (e.code === 'Enter')
      ? 'cmd:enter'
      : 'cmd:change'
    emit(action, input.value)
  })

  return el

}

export function welcome () {
  return html`<div><strong>Welcome to dterm.</strong> Type <code>help</code> if you get lost.</div>`
}

/**
 * Private elements
 */
function output (entry) {
  var out, el = html`<div class="entry"></div>`
  if (typeof entry.in === 'string') {
    el.appendChild(prompt(entry.cwd, entry.in))
  }
  for (out of entry.out) {
    el.appendChild(content(out))
  }
  return el
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