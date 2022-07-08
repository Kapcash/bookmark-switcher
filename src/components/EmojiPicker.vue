<template>
  <fieldset class="emoji-grid">
    <label
      title="none"
      :class="['default', { active: !selectedEmoji }]"
    >
      <input
        v-model="selectedEmoji"
        type="radio"
        name="emoji"
        :value="null"
        hidden
      >
    </label>

    <label
      v-for="emoji in emojiList"
      :key="emoji.slug"
      :class="{ active: selectedEmoji === emoji.character }"
    >
      {{ emoji.character }}
      <input
        v-model="selectedEmoji"
        type="radio"
        name="emoji"
        :value="emoji.character"
        hidden
      >
    </label>
  </fieldset>
</template>

<script>
import { computed } from 'vue'
import { EMOJI_API_KEY } from '../constants'

export default {
  name: 'EmojiPicker',
  props: {
    modelValue: { type: [String, null] },
  },
  emits: ['update:modelValue'],
  async setup (props, ctx) {
    const emojiList = await fetch(`https://emoji-api.com/emojis?access_key=${EMOJI_API_KEY}`).then(res => res.json()).catch(() => [])
    const selectedEmoji = computed({
      get () {
        return props.modelValue
      },
      set (newEmoji) {
        ctx.emit('update:modelValue', newEmoji)
      },
    })

    return { emojiList, selectedEmoji }
  },
}
</script>

<style scoped>
fieldset {
  border: none;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  max-height: 400px;
  overflow-y: auto;
}

label {
  text-align: center;
  font-size: 1.5rem;
  cursor: pointer;
  margin: 3px;
  padding: 4px;
  border-radius: 8px;
}
label:hover {
  background-color: rgba(255, 255, 255, 0.25);
}
label.default {
  border: 1px solid rgba(255, 255, 255, 0.25);
}
label.active {
  background-color: rgba(105, 172, 178, 0.25);
  border: 1px solid white;
}
</style>
