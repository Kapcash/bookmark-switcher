<template>
  <div class="row">
    <button type="button" :title="i18n.changeIconTooltip" class="btn-icon flex-min" @click="$emit('icon')">
      {{ icon }}
    </button>
    <input type="text" :title="i18n.changeNameTooltip" ref="bookmarkNameInput" v-model="barName">
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import browser from 'webextension-polyfill'

export default {
  name: 'BookmarkBarEdit',
  props: {
    name: {
      type: String,
      required: true,
    },
    icon: {
      type: [String, null],
      required: false,
    },
  },
  emits: ['update:name', 'icon'],
  setup (props, ctx) {
    const barName = computed({
      get () {
        return props.name
      },
      set (name) {
        ctx.emit('update:name', name)
      },
    })

    const bookmarkNameInput = ref(null)

    onMounted(() => {
      bookmarkNameInput.value.focus()
    })

    return {
      barName,
      bookmarkNameInput,
    }
  },
}
</script>

<style scoped>
input {
  width: 0;
  min-width: 0;
  flex: 1 1 auto;
}
.flex-min {
  flex: 0 1 auto;
  flex-basis: 35px;
}
</style>
