<template>
  <label>
    Switch bar shortcut:
    <input ref="hotkeys" name="hotkeys" :value="modelValue" readonly @focusin="inputHasFocus = true" @focusout="inputHasFocus = false"/>
    <button v-show="modelValue" class="clear" @click="selectedKeys = []">
      <svg xmlns="http://www.w3.org/2000/svg" width="12px" height="12px" x="0" y="0" viewBox="0 0 329.26933 329">
        <path xmlns="http://www.w3.org/2000/svg" d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"></path>
      </svg>
    </button>
    <span v-show="!isValid" class="error">Invalid hotkeys</span>
    <span v-show="error" class="errors">{{ error }}</span>
  </label>
</template>

<script lang="ts">
import { useMagicKeys } from '@vueuse/core'

export default {
  setup () {
    const { current } = useMagicKeys()
    return { current }
  },
  data () {
    return {
      error: '',
      inputHasFocus: false,
    }
  },
  props: {
    modelValue: { type: Array, required: true },
  },
  computed: {
    input () {
      return this.$refs.hotkeys
    },
    keys () {
      return Array.from(this.current).map(this.convertKey)
    },
    selectedKeys: {
      get () {
        return this.modelValue.split('+')
      },
      set (keys) {
        this.$emit('update:modelValue', keys.join('+'))
      },
    },
    hasMetaKey () {
      return navigator.platform.includes('Mac')
    },
    isValid () {
      const modifiers = ['Ctrl', 'MacCtrl', 'Alt', 'Cmd']
      const includesModifier = modifiers.some(mod => this.selectedKeys.includes(mod))
      const isFunctionKey = this.selectedKeys.some(key => key.length >= 2 && key[0] === 'f')
      return (includesModifier && this.selectedKeys.length >= 2) || isFunctionKey
    },
  },
  watch: {
    keys (newKeys) {
      if (this.inputHasFocus && newKeys.length > 0) {
        this.selectedKeys = newKeys
      }
    },
  },
  methods: {
    convertKey (k) {
      switch (k.toLowerCase()) {
        case ' ': // non-breakable space &nbsp;
        case ' ':
          return 'Space'
        case 'meta':
          return 'Cmd'
        case 'alt':
          return 'Alt'
        case 'ctrl':
        case 'control':
          return this.hasMetaKey ? 'MacCtrl' : 'Ctrl'
        default:
          return k
      }
    },
  },
}
</script>

<style scoped>
label {
  position: relative;
}
button.clear {
  all: initial;
  position: absolute;
  top: 0px;
  bottom: 0px;
  right: 6px;
  cursor: pointer;
}
button.clear:hover {
  color: darkred;
}

svg path {
  fill: currentColor;
  opacity: 0.9;
}
</style>
