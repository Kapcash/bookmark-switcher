<template>
  <div ref="hotkeys" tabindex="0" class="shortcut-grid">
    <span class="legend">{{ i18n.focusMe }}</span>
    <div class="key-column required" :class="{ 'invalid': !hasModifier && dirty }">
      <KeyState :active="focused && ctrl">
        Ctrl
      </KeyState>
      <KeyState :active="focused && alt">
        Alt
      </KeyState>
      <KeyState v-show="isMacOS" :active="focused && meta">
        Cmd
      </KeyState>
    </div>

    <div class="key-column">
      <KeyState :active="focused && shift" optional>
        Shift
      </KeyState>
    </div>
    <div class="key-column required" :class="{ 'invalid': !hasNormalKey && dirty }">
      <KeyState placeholder="Press" :empty="!normalKeysString">
        {{ normalKeysString }}
      </KeyState>
    </div>
  </div>
</template>

<script setup>
  import { computed, watch, defineEmits, ref } from 'vue'
  import { watchOnce, useFocus } from '@vueuse/core'
  import { useHotkeys } from '../composables/useHotkeys'
  import KeyState from './KeyState.vue';

const emit = defineEmits(['update:modelValue'])
defineProps({
  modelValue: { type: Array, required: true, default: () => [] },
})

const hotkeys = ref(null)
const { focused } = useFocus(hotkeys)

const dirty = ref(false)

watch(focused, (isFocused) => {
  if (isFocused) {
    watchOnce(current, () => {
      dirty.value = true
    })
  } else {
    dirty.value = false
  }
})

const isMacOS = navigator.userAgent.includes('Mac OS X')

const {
  normalKeys,
  savedHotkeys,
  hasModifier,
  formatKey,
  current,
  ctrl,
  alt,
  meta,
  shift,
  hasNormalKey,
} = useHotkeys(focused);

const normalKeysString = computed(() => {
  return normalKeys.value.map(formatKey).join(' + ')
})

watch(savedHotkeys, (newHotkeys) => {
  emit('update:modelValue', newHotkeys)
})
</script>

<style scoped>
.shortcut-grid {
  position: relative;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  padding-top: 24px;

  font-family: monospace;

  border: 1px dashed grey;
  border-radius: 8px;
}

.shortcut-grid:focus {
  border-color: lightblue;
}
.shortcut-grid:focus .legend{
  visibility: hidden;
}
.shortcut-grid:hover:not(:focus) {
  cursor: pointer;
}
.key-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px;
  border-radius: 4px;
}
.key-column.required {
  border: 1px dashed transparent;
}
.key-column.invalid {
  border-color: orange !important;
}

.legend {
  position: absolute;
  top: 5px;
  left: 0px;
  right: 0px;
  color: slategray;
  display: inline;
  text-align: center;
  font-size: 0.85rem;
}
</style>
