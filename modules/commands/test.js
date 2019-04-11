import assert from '../assert.js'
import html from '../../shared/nanohtml-v1.2.4.js'
import joinPath from '../join-path.js'

export default async function (opts, module) {
  var path = joinPath(window.location.pathname, module)
  var mod = await import('dat:/' + path)
  assert(typeof mod.test === 'function')
  
  if (!mod.test()) {
    return html`<div class="error error-stack">
      Tests failed, check console for details
	</div>`
  }
}