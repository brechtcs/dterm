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
    store.home = val
  },
  get env () {
    return store.env
  },
  set env (val) {
    store.env = val
  },
  get cwd () {
    return store.cwd
  },
  set cwd (next) {
    next = next || this.home
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