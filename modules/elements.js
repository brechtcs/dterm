import html from '../vendor/nanohtml-v1.2.4.js'
import shortenHash from './shorten-hash.js'

export function TerminalElement (state, emit) {
  return html`<main>
    <div class="output">
      ${state.entries.map(output)}
    </div>
    ${PromptElement(state.cwd, state.prompt, emit)}
  </main>`
}

export function ErrorElement (err) {
  let el = html`<div class="error"></div>`
  let header = html`<div class="error-header">${err.description || err.message}</div>`
  let stack = html `<div class="error-stack"></div>`
  stack.innerText = err.stack

  el.appendChild(header)
  el.appendChild(stack)
  return el
}

export function PreElement (content) {
  if (typeof content === 'string' || typeof content === 'undefined') {
    return html`<pre>${content || ''}</pre>`
  } else {
    return html`<pre>${JSON.stringify(content, null, 2)}</pre>`
  }
}

export function PromptElement (cwd, value, emit) {
  let interactive = !!emit
  let prompt =  cwd && `dat://${shortenHash(cwd.key)}/${cwd.path}`
  let input = html`<input value=${value || ''} readonly>`
  let el = html`<div class="prompt">${prompt} ${input}</div>`

  if (value === false) el.setAttribute('hidden', '')
  if (!interactive) return el

  input.classList.add('interactive')
  input.removeAttribute('readonly')

  input.addEventListener('keydown', function (e) {
    if (e.code === 'Tab') {
      e.preventDefault()
      emit('menu:nav', {back: e.shiftKey})
    } else if (e.code === 'Enter') {
      emit('cmd:enter', input.value)
    }
  })

  input.addEventListener('input', function (e) {
    emit('cmd:change', input.value)
  })

  return el

}

export function SandboxElement () {
  return html`<iframe src="/sandbox" sandbox="allow-scripts" hidden></iframe>`
}

export function WelcomeElement () {
  return html`<div><strong>Welcome to dterm.</strong> Type <code>help</code> if you get lost.</div>`
}

/**
 * Private elements
 */
function output (entry) {
  let out, el = html`<div class="entry"></div>`
  if (typeof entry.in === 'string') {
    el.appendChild(PromptElement(entry.cwd, entry.in))
  }
  for (out of entry.out) {
    el.appendChild(out)
  }
  return el
}
