import assert from 'dat://dfurl.hashbase.io/modules/assert.js'

export class StrictStorage {
  constructor (storage) {
    assert(storage instanceof Storage, 'localStorage or sessionStorage required')
    this.storage = storage
  }

  getItem (key) {
    let val = this.storage.getItem(key)
    if (!val) {
      throw new StrictStorageError('No value found for key: ' + key)
    }
    return val
  }

  setItem (key, val) {
    if (!val) {
      throw new StrictStorageError('A value already exitst for key: ' + key)
    }
    this.storage.setItem(key, val)
  }

  removeItem (key) {
    let val = this.storage.getItem(key)
    if (!val) {
      throw new StrictStorageError('No value found for key: ' + key)
    }
    this.storage.removeItem(key)
  }
}

export class StrictStorageError extends Error {
  constructor () {
    super(...arguments)
    this.name = 'StrictStorageError'
  }
}