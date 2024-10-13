<template>
  <div class="overflow-hidden">
    <div class="row">
      <button
        class="btn-icon"
        :title="i18n.goBackTooltip"
        @click="$emit('back')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          width="16px"
          height="16px"
          x="0"
          y="0"
          viewBox="0 0 64 64"
        >
          <path
            xmlns="http://www.w3.org/2000/svg"
            d="m54 30h-39.899l15.278-14.552c.8-.762.831-2.028.069-2.828-.761-.799-2.027-.831-2.828-.069l-17.448 16.62c-.755.756-1.172 1.76-1.172 2.829 0 1.068.417 2.073 1.207 2.862l17.414 16.586c.387.369.883.552 1.379.552.528 0 1.056-.208 1.449-.621.762-.8.731-2.065-.069-2.827l-15.342-14.552h39.962c1.104 0 2-.896 2-2s-.896-2-2-2z"
          />
        </svg>
      </button>
      <input
        v-model="filter"
        :placeholder="i18n.emojiFilter"
        class="flex-auto"
      >
    </div>

    <fieldset class="emoji-grid">
      <label
        :title="i18n.noneEmojiName"
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
        v-for="emoji in emojiListFiltered"
        :key="emoji.slug"
        :class="{ active: selectedEmoji === emoji.character }"
        :title="emoji.unicodeName"
      >
        <span>{{ emoji.character }}</span>
        <input
          v-model="selectedEmoji"
          type="radio"
          name="emoji"
          :value="emoji.character"
          hidden
        >
      </label>
    </fieldset>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { EMOJI_API_KEY, MAX_EMOJI_VERSION } from '@/logic/constants'

export default {
  name: 'EmojiPicker',
  props: {
    modelValue: { type: [String, null] },
  },
  emits: ['update:modelValue', 'back'],
  async setup (props, ctx) {
    const emojiList = await fetch(`https://emoji-api.com/emojis?access_key=${EMOJI_API_KEY}`)
      .then(res => res.json())
      .then(emojis => {
        return emojis.filter(char => {
          try {
            const [unicodeVersion] = char.slug.split('-')
            const version = parseInt(unicodeVersion.slice(1), 10)
            return version <= MAX_EMOJI_VERSION
          } catch {
            return true // If fail -> return all to avoid empty list in case of api breaking change.
          }
      })
      })
      .catch((err) => {
        console.error("Can't fetch emoji list", err)
        return []
      })

    const selectedEmoji = computed({
      get () {
        return props.modelValue
      },
      set (newEmoji) {
        ctx.emit('update:modelValue', newEmoji)
      },
    })

    const filter = ref('')

    const emojiListFiltered = computed(() => {
      return emojiList.filter(emoji => emoji.unicodeName.includes(filter.value))
    })

    return {
      filter,
      emojiListFiltered,
      selectedEmoji,
    }
  },
}
</script>

<style scoped>
input.row {
  width: 100%;
}
fieldset {
  border: none;
  padding: 3px;
}
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 4px;
  max-height: 400px;
  overflow-y: auto;
}

label {
  text-align: center;
  font-size: 1.5rem;
  cursor: pointer;
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
