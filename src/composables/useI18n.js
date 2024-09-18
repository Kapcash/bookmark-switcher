import browser from 'webextension-polyfill'

export function useI18n () {
  const messages = new Proxy(Object.freeze({}), {
    get (obj, prop) {
      return browser.i18n.getMessage(prop)
    },
  })

  return messages
}
