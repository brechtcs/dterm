import assert from '../modules/assert.js'
import html from '../shared/nanohtml-v1.2.4.js'
import joinPath from '../modules/join-path.js'

export default async function (opts, module) {
  var t = new Test()
  var path = joinPath(window.location.pathname, module)
  var mod = await import(`dat:/${path}?nocache=${Date.now()}`)
  assert(typeof mod.test === 'function')

  try {
    console.time(module + ' tests')
    await mod.test(t)
  } catch (err) {
    console.error(err)
    t.passed = false
  } finally {
    console.timeEnd(module + ' tests')
  }

  if (!t.passed) {
    return html`<div class="error error-stack">
      Tests failed, check console for details
	</div>`
  }
}

class Test {
  constructor () {
    this.passed = true
  }

  ok (condition, msg) {
    if (condition) {
      console.info(msg)
    } else {
      console.error(msg)
      this.passed = false
    }
  }
}