// Duplicated from vueuse source code.
// Only change is to put in the Set the event *code* instead of event *key*

import { computed, reactive, ref, unref } from 'vue-demi'
import { noop } from '@vueuse/shared'
import { useEventListener } from '@vueuse/core'
export const DefaultMagicKeysAliasMap = {
  ctrl: 'control',
  command: 'meta',
  cmd: 'meta',
  option: 'alt',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
}

/**
 * Reactive keys pressed state, with magical keys combination support.
 *
 * @see https://vueuse.org/useMagicKeys
 */
export function useMagicKeys(options = {}) {
  const {
    reactive: useReactive = false,
    target = window,
    aliasMap = DefaultMagicKeysAliasMap,
    passive = true,
    onEventFired = noop,
  } = options
  const current = reactive(new Set())
  const obj = {
    toJSON() { return {} },
    current,
  }
  const refs = useReactive ? reactive(obj) : obj
  const metaDeps = new Set()
  const usedKeys = new Set()

  function setRefs(key, value) {
    if (key in refs) {
      if (useReactive)
        refs[key] = value
      else
        refs[key].value = value
    }
  }

  function reset() {
    current.clear()
    for (const key of usedKeys)
      setRefs(key, false)
  }

  function updateRefs(e, value) {
    const key = e.key?.toLowerCase()
    const code = e.code?.toLowerCase()
    const values = [code, key].filter(Boolean)

    // current set
    if (code) {
      if (value)
        current.add(code)
      else
        current.delete(code)
    }

    for (const key of values) {
      usedKeys.add(key)
      setRefs(key, value)
    }

    // #1312
    // In macOS, keys won't trigger "keyup" event when Meta key is released
    // We track it's combination and release manually
    if (key === 'meta' && !value) {
      // Meta key released
      metaDeps.forEach((key) => {
        current.delete(key)
        setRefs(key, false)
      })
      metaDeps.clear()
    }
    else if (typeof e.getModifierState === 'function' && e.getModifierState('Meta') && value) {
      [...current, ...values].forEach(code => metaDeps.add(code))
    }
  }

  useEventListener(target, 'keydown', (e) => {
    updateRefs(e, true)
    return onEventFired(e)
  }, { passive })
  useEventListener(target, 'keyup', (e) => {
    updateRefs(e, false)
    return onEventFired(e)
  }, { passive })

  // #1350
  useEventListener('blur', reset, { passive: true })
  useEventListener('focus', reset, { passive: true })

  const proxy = new Proxy(
    refs,
    {
      get(target, prop, rec) {
        if (typeof prop !== 'string')
          return Reflect.get(target, prop, rec)

        prop = prop.toLowerCase()
        // alias
        if (prop in aliasMap)
          prop = aliasMap[prop]
        // create new tracking
        if (!(prop in refs)) {
          if (/[+_-]/.test(prop)) {
            const keys = prop.split(/[+_-]/g).map(i => i.trim())
            refs[prop] = computed(() => keys.every(key => unref(proxy[key])))
          }
          else {
            refs[prop] = ref(false)
          }
        }
        const r = Reflect.get(target, prop, rec)
        return useReactive ? unref(r) : r
      },
    },
  )

  return proxy
}
