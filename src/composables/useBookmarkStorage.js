import { reactive, toRef, watch } from 'vue'

// Global shared state
const state = reactive({})

export function useBrowserStorage (sync = true) {
  const storage = getStorage(sync)

  function resetStorage () {
    storage.clear().then(() => {
      for (const key in state) {
        delete state[key]
      }
    })
  }

  async function useBrowserStorageKey (key) {
    const stateRef = toRef(state, key)
    if (!(key in state)) {
      const initialStoredValue = await getKey(key, storage)
      console.log('Loading storage value', `${key}:`, initialStoredValue)
      stateRef.value = initialStoredValue
    }

    watch(stateRef, (newValue, oldValue) => {
      console.log('Ref updated!', `${key}:`, oldValue, newValue)
      setKey(key, newValue, storage)
    })

    return toRef(state, key)
  }

  // Watch changes on store and update ref
  storage.onChanged.addListener((storedState) => {
    Object.entries(storedState)
      .filter(([key, val]) => val.newValue !== val.oldValue && state[key] !== val.newValue)
      .forEach(([key, { newValue }]) => {
        console.log('Stored changed!', `${key}:`, state[key], newValue)
        state[key] = newValue
      })
  })

  return {
    useBrowserStorageKey,
    resetStorage
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
