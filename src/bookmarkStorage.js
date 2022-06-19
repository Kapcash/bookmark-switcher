
export function getStorageKey (key) {
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, (items) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        return resolve(items[key])
      })
    })
  } else {
    return browser.storage.sync.get(key).then((storage) => storage[key])
  }
}

export function storeKey (key, value) {
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({
        [key]: value,
      }, (res) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        return resolve(res)
      })
    })
  } else {
    return browser.storage.sync.set({
      [key]: value,
    })
  }
}

export function listenStoreChange (callback) {
  browser.storage.onChanged.addListener(callback)
}
