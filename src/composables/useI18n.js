export function useI18n (...keys) {
  const messages = new Proxy(Object.freeze({}), {
    get (obj, prop) {
      return browser.i18n.getMessage(prop)
    },
  })

  return messages
}
