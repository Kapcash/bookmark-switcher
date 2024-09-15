import { reactive, toRef, watch } from 'vue'
import _isEqual from 'lodash.isequal'
import browser from 'webextension-polyfill'

// Global shared state
const state = reactive({})

export function useBrowserStorage(sync = true) {
  const storage = getStorage(sync)

  function resetStorage() {
    return clear(storage).then(() => {
      for (const key in state)
        state[key] = null
    })
  }

  async function useBrowserStorageKey(key, defaultValue) {
    if (!(key in state)) {
      const initialStoredValue = await getKey(key, storage)
      console.debug('Loading storage value', `${key}:`, initialStoredValue)
      state[key] = initialStoredValue ?? null

      if (initialStoredValue == undefined && !!defaultValue) {
        state[key] = defaultValue
      }

      watch(() => state[key], (newValue, oldValue) => {
        if (newValue === undefined) {
          state[key] = null
        }
        console.debug('Ref updated!', `${key}:`, oldValue, '->', newValue)
        setKey(key, newValue, storage)
      })
    }
    return toRef(state, key)
  }

  // Watch changes on store and update ref
  browser.storage.onChanged.addListener((storedState) => {
    const isEqual = (key, val) => _isEqual(val.newValue, val.oldValue) || _isEqual(state[key], val.newValue)
    const serializeStoredValue = val => (!!val && typeof val === 'object' && (Object.prototype.hasOwnProperty.call(val, '0') || Object.keys(val).length === 0)) ? Object.values(val) : val

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
function getStorage(sync = true) {
  const storageKey = sync ? 'sync' : 'local'
  return browser.storage[storageKey]
}

/** Async! Get a stored value from a given key */
function getKey(key, storage) {
  let storagePromise = storage.get(key)

  return storagePromise.then((storage) => {
    return storage[key]
  })
}

/** Async! Store a new value with the given key */
function setKey(key, value, storage) {
  return storage.set({ [key]: value })
}

function clear(storage) {
  return storage.clear()
}
