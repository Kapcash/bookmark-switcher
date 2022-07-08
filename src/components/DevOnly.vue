<template>
  <section v-if="isDev">
    <button v-if="isDev" type="button" @click="clear">CLEAR</button>
    <button v-if="isDev" type="button" @click="setIcon">ICON</button>
  </section>
</template>

<script>
import { useBrowserStorage } from '@/composables/useBrowserStorage'

export default {
  name: 'DevOnly',
  setup () {
    const isDev = process.env.NODE_ENV !== 'production'

    function clear () {
      if (isDev) {
        const { resetStorage } = useBrowserStorage()
        resetStorage()
      }
    }

    return {
      isDev,
      clear,
    }
  },
}
</script>
