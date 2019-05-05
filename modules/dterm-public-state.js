import assert from './assert.js'

const obj = {}
const store = {
  home: null,
  env: null,
  cwd: null,
  prompt: false
}

const state = {
  get home () {
    return store.home
  },

  set home (val) {
    assert(val.archive instanceof DatArchive, 'home.archive should be DatArchive')
    assert(typeof val.key === 'string', 'home.key should be string')
    assert(typeof val.path === 'string', 'home.path should be string')

    store.home = val
  },

  get env () {
    return store.env
  },

  set env (val) {
    assert(typeof val.commands === 'object', 'env.commands should be object')
    assert(typeof val.config === 'object', 'env.config should be object')

    store.env = val
  },

  get cwd () {
    return store.cwd
  },

  set cwd (next) {
    next = next || this.home

    assert(next.archive instanceof DatArchive, 'cwd.archive should be DatArchive')
    assert(typeof next.key === 'string', 'cwd.key should be string')
    assert(typeof next.path === 'string', 'cwd.path should be string')

    window.history.pushState(null, obj, `/${next.key}/${next.path}`)
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