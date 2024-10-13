<script>
import { useBrowserStorage } from '@/composables/useBrowserStorage'

export default {
  name: 'DevOnly',
  setup() {
    const isDev = process.env.NODE_ENV !== 'production'

    function clear() {
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

<template>
  <section v-if="isDev">
    <button v-if="isDev" type="button" @click="clear">
      CLEAR
    </button>
  </section>
</template>
