import {DistributedFilesURL} from 'dat://dfurl.hashbase.io/modules/url.js'
import assert from 'dat://dfurl.hashbase.io/modules/assert.js'

const obj = {}
const store = {
  title: '',
  env: null,
  cwd: null,
  prompt: false
}

const state = {
  get title () {
    return store.title
  },

  set title (title) {
    document.title = title + ' - dterm'
    store.title = title
  },

  get home () {
    console.warn('Home archive feature was deprecated')
    return null
  },

  set home (home) {
    console.warn('Home archive feature was deprecated')
  },

  get env () {
    return store.env
  },

  set env (env) {
    if (store.env) {
      throw new Error('Cannot overwrite env property')
    }
    assert(typeof env.commands === 'object', 'env.commands should be object')
    assert(typeof env.config === 'object', 'env.config should be object')

    Object.freeze(env.commands)
    Object.freeze(env.config)
    store.env = Object.freeze(env)
  },

  get cwd () {
    return store.cwd
  },

  set cwd (next) {
    assert(next instanceof DistributedFilesURL, 'cwd should be DistributedFilesURL object')
    window.history.pushState(null, obj, next.pathname)
    store.cwd = next
  },

  get prompt () {
    return store.prompt
  },

  set prompt (val) {
    store.prompt = val
  }
}

export default state
