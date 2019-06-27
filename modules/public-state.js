const HOME_DEPRECATED = "dterm's `home-dat` feature is deprecated"
const STATE_DEPRECATED = "dterm's `public-state` module is deprecated"

const state = {
  get title () {
    console.warn(STATE_DEPRECATED)
    return document.title.replace(' - dterm', '')
  },

  set title (title) {
    console.warn(STATE_DEPRECATED)
    document.title = title + ' - dterm'
  },

  get home () {
    console.warn(STATE_DEPRECATED)
    console.warn(HOME_DEPRECATED)
    return null
  },

  set home (home) {
    console.warn(STATE_DEPRECATED)
    console.warn(HOME_DEPRECATED)
  },

  get env () {
    console.warn(STATE_DEPRECATED)
    return window.env
  },

  set env (env) {
    console.warn(STATE_DEPRECATED)
    window.env = env
  },

  get cwd () {
    console.warn(STATE_DEPRECATED)
    return window.cwd
  },

  set cwd (next) {
    console.warn(STATE_DEPRECATED)
    window.cwd = next
  },

  get prompt () {
    console.warn(STATE_DEPRECATED)
    return null
  },

  set prompt (val) {
    console.warn(STATE_DEPRECATED)
  }
}

export default state
