import assert from './assert.js'
import ready from '../shared/document-ready-v2.0.2.js'
import nanobus from '../shared/nanobus-v4.4.0.js'
import nanomorph from '../shared/nanomorph-v5.1.3.js'

export default function control () {
  return new ElementController(...arguments)
}

class ElementController {
  constructor (selector) {
    this.bus = nanobus()
    this.init = []
    this.state = {}

    ready(() => {
      this.el = document.querySelector(selector)
    })
  }

  emit () {
    this.bus.emit(...arguments)
  }

  render () {
    if (this.init) {
      this.init.forEach(store => store(this.state))
      Object.seal(this.state)
      delete this.init
    }
    if (this.el === undefined) {
      return ready(this.render.bind(this))
    }
    var page = this.factory(this.state, this.emit.bind(this))
    assert(page instanceof Element, 'view must return Element')
    nanomorph(this.el, page)
  }

  use (fn) {
    assert(typeof fn === 'function', 'store must be function')
    this.init.push(state => fn(state, this.bus, this))
  }

  view (fn) {
    assert(typeof fn === 'function', 'view must be function')
    this.factory = fn
  }
}
