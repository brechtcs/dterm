import html from '../vendor/nanohtml-v1.2.4.js'
import publicState from './public-state.js'
import shortenHash from './shorten-hash.js'

export function terminal (state, emit) {
  return html`<main>
    <div class="output">
      ${state.entries.map(output)}
    </div>
    ${prompt(state.public.cwd, state.public.prompt, emit)}
  </main>`
}

export function error (err) {
  let el = html`<div class="error"></div>`
  let header = html`<div class="error-header">${err.message}</div>`
  let stack = html `<div class="error-stack"></div>`
  stack.innerText = err.stack

  el.appendChild(header)
  el.appendChild(stack)
  return el
}

export function prompt (cwd, value, emit) {
  let interactive = !!emit
  let home = publicState.home
  let prompt = (cwd && cwd.key !== home.key ? `dat://${shortenHash(cwd.key)}` : '~') + (cwd && cwd.path ? '/' + cwd.path : '')
  let input = html`<input value=${value || ''} disabled>`
  let el = html`<div class="prompt">${prompt} ${input}</div>`

  if (value === false) el.setAttribute('hidden', '')
  if (!interactive) return el

  input.classList.add('interactive')
  input.removeAttribute('disabled')
  input.addEventListener('keyup', function (e) {
    let action = (e.code === 'Enter')
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
  let out, el = html`<div class="entry"></div>`
  if (typeof entry.in === 'string') {
    el.appendChild(prompt(entry.cwd, entry.in))
  }
  for (out of entry.out) {
    el.appendChild(content(out))
  }
  return el
}

function content (out) {
  let el = html`<div class="entry-content"></div>`
  if (out instanceof Element) {
    el.appendChild(out)
  } else {
    el.innerHTML = out
  }
  return el
}
