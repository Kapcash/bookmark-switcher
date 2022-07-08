import { reactive, toRef, watch } from 'vue'
import _isEqual from 'lodash.isequal'

// Global shared state
const state = reactive({})

export function useBrowserStorage (sync = true) {
  const storage = getStorage(sync)

  function resetStorage () {
    return storage.clear().then(() => {
      for (const key in state) {
        state[key] = undefined
      }
    })
  }

  async function useBrowserStorageKey (key) {
    if (!(key in state)) {
      const initialStoredValue = await getKey(key, storage)
      console.debug('Loading storage value', `${key}:`, initialStoredValue)
      state[key] = initialStoredValue

      watch(() => state[key], (newValue, oldValue) => {
        console.debug('Ref updated!', `${key}:`, oldValue, '->', newValue)
        setKey(key, newValue, storage)
      })
    }
    return toRef(state, key)
  }

  // Watch changes on store and update ref
  storage.onChanged.addListener((storedState) => {
    const isEqual = (key, val) => {
      return _isEqual(val.newValue, val.oldValue) || _isEqual(state[key], val.newValue)
    }

    Object.entries(storedState)
      .filter(([key, val]) => !isEqual(key, val))
      .forEach(([key, { newValue }]) => {
        console.debug('Stored changed!', `${key}:`, state[key], '->', newValue)
        state[key] = newValue
      })
  })

  return {
    useBrowserStorageKey,
    resetStorage,
  }
}

/** Return the storage object, depends on the current browser */
function getStorage (sync = true) {
  const storageKey = sync ? 'sync' : 'local'
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return chrome.storage[storageKey]
  } else {
    return browser.storage[storageKey]
  }
}

/** Async! Get a stored value from a given key */
function getKey (key, storage) {
  let storagePromise
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    storagePromise = chromeAsync(cb => storage.get(key, cb))
  } else {
    storagePromise = storage.get(key)
  }
  return storagePromise.then((storage) => storage[key])
}

/** Async! Store a new value with the given key */
function setKey (key, value, storage) {
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return chromeAsync(cb => storage.set({ [key]: value, cb }))
  } else {
    return storage.set({ [key]: value })
  }
}

/** Simulates async behaviour for storage functions on chrome */
function chromeAsync (action) {
  return new Promise((resolve, reject) => {
    action((res) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      return resolve(res)
    })
  })
}
