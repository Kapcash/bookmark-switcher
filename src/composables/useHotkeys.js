import { computed, ref, watch } from 'vue'
import { useMagicKeys } from './useMagicKeys'

export function useHotkeys (disabled) {
  const { ctrl, alt, meta, shift, current } = useMagicKeys()

  const modifiers = ['control', 'ctrl', 'os', 'cmd', 'command', 'meta', 'alt', 'shift']
  const modifiersAndShift = [...modifiers, 'shift']
  const namingMap = {
    'os': 'Command',
    'ctrl': 'Ctrl',
    'alt': 'Alt',
    'control': 'MacCtrl',
  }

  const currentModifiers = computed(() => {
    if (!disabled.value) { return [] }
    return Array.from(current).filter(key => modifiers.some(modif => key.toLowerCase().includes(modif)))
  })

  const normalKeys = computed(() => {
    if (!disabled.value) { return [] }
    return Array.from(current).filter(key => !modifiersAndShift.some(modif => key.toLowerCase().includes(modif)))
  })

  function formatKey (key) {
    if (key.toLowerCase().startsWith('key')) {
      return key.substring(3)
    }
    if (!key.startsWith('arrow')) {
      key = key.replace('right', '')
      key = key.replace('left', '')
    }
    if (key.startsWith('digit')) {
      key = key.replace('digit', '')
    }
    if (key === ' ') {
      return 'Space'
    }
    if (namingMap[key]) {
      key = namingMap[key]
    }
    return key
  }

  const hasModifier = computed(() => disabled.value && (ctrl.value || alt.value || meta.value))
  const hasNormalKey = computed(() => disabled.value && normalKeys.value.length > 0)
  const isValid = computed(() => disabled.value && hasModifier.value && hasNormalKey.value)

  const savedHotkeys = ref('')

  watch(currentModifiers, () => {
    if (!isValid.value || !disabled.value) { return }
    const newShortcut = Array.from(current).map(formatKey)
    savedHotkeys.value = newShortcut
  })

  watch(normalKeys, (newKeys, oldKeys) => {
    if (!isValid.value || !disabled.value) { return }
    const newShortcut = Array.from(current).map(formatKey)
    if (newKeys.length > oldKeys.length) {
      savedHotkeys.value = newShortcut
    }
  })

  // watchEffect(() => {
  //   if (!isValid.value || !disabled.value) { return }
  //   const newShortcut = Array.from(current).map(formatKey).join(' + ')
  //   if (savedHotkeys.value.length < newShortcut.length || newShortcut.startsWith(savedHotkeys.value)) {
  //     savedHotkeys.value = newShortcut
  //   }
  // })

  return {
    formatKey,
    normalKeys,
    savedHotkeys,
    hasModifier,
    current,
    ctrl,
    alt,
    meta,
    shift,
    hasNormalKey,
   }
}
