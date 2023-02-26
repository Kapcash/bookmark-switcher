import { reactive, toRef, watch } from 'vue'
import _isEqual from 'lodash.isequal'

// Global shared state
const state = reactive({})

export function useBrowserStorage (sync = true) {
  const storage = getStorage(sync)

  function resetStorage () {
    return clear(storage).then(() => {
      for (const key in state) {
        state[key] = null
      }
    })
  }

  async function useBrowserStorageKey (key, defaultValue) {
    if (!(key in state)) {
      const initialStoredValue = await getKey(key, storage)
      console.debug('Loading storage value', `${key}:`, initialStoredValue)
      state[key] = initialStoredValue

      watch(() => state[key], (newValue, oldValue) => {
        if (newValue === undefined) { state[key] = null }
        console.debug('Ref updated!', `${key}:`, oldValue, '->', newValue)
        setKey(key, newValue, storage)
      })

      if (initialStoredValue == undefined && !!defaultValue) {
        state[key] = defaultValue
      }
    }
    return toRef(state, key)
  }

  // Watch changes on store and update ref
  const storageParent = process.env.VUE_APP_IS_CHROME === 'true' ? chrome.storage : browser.storage
  storageParent.onChanged.addListener((storedState) => {
    const isEqual = (key, val) => _isEqual(val.newValue, val.oldValue) || _isEqual(state[key], val.newValue)
    const serializeStoredValue = (val) => !!val && typeof val === 'object' && (Object.prototype.hasOwnProperty.call(val, '0') || Object.keys(val).length === 0) ? Object.values(val) : val

    Object.entries(storedState)
      .map(([key, { newValue, oldValue }]) => [key, { newValue: serializeStoredValue(newValue), oldValue: serializeStoredValue(oldValue) }])
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
  return storagePromise.then((storage) => {
    return storage[key]
  })
}

/** Async! Store a new value with the given key */
function setKey (key, value, storage) {
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return chromeAsync(cb => storage.set({ [key]: value, cb }))
  } else {
    return storage.set({ [key]: value })
  }
}

function clear (storage) {
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return chromeAsync(cb => storage.clear(cb))
  } else {
    return storage.clear()
  }
}

/** Simulates async behaviour for storage functions on chrome */
function chromeAsync (responseCb) {
  return new Promise((resolve, reject) => {
    responseCb((res) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }
      return resolve(res)
    })
  })
}
