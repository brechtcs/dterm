import {DistributedFilesURL} from 'dat://dfurl.hashbase.io/modules/url.js'
import assert from 'dat://dfurl.hashbase.io/modules/assert.js'

const obj = {}
const store = {
  title: '',
  home: null,
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
    return store.home
  },

  set home (home) {
    assert(home instanceof DistributedFilesURL, 'home should be DistributedFilesURL object')
    store.home = home
  },

  get env () {
    return store.env
  },

  set env (env) {
    assert(typeof env.commands === 'object', 'env.commands should be object')
    assert(typeof env.config === 'object', 'env.config should be object')

    store.env = env
  },

  get cwd () {
    return store.cwd
  },

  set cwd (next) {
    next = next.key ? next : this.home
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
