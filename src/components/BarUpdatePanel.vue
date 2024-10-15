<script>
import { ref } from 'vue'
import BookmarkBarEdit from '@/components/BookmarkBarEdit.vue'
import ConfirmBar from '@/components/ConfirmBar.vue'

export default {
  name: 'BarUpdatePanel',
  components: { BookmarkBarEdit, ConfirmBar },
  props: {
    bookmarks: { type: Array, required: true },
    title: { type: String, required: true },
    icon: { type: [String, null], required: false },
    isActive: { type: Boolean, default: false },
  },
  emits: ['submit', 'pin', 'cancel', 'remove', 'update:title', 'icon'],
  setup(props, ctx) {
    const UNKNOWN_BOOKMARK_NAME = '?'
    const PIN_ENABLED = ref(true)

    const barName = ref(props.title)
    const confirmDelete = ref(false)

    function onSubmit() {
      ctx.emit('update:title', barName.value)
      ctx.emit('submit')
    }

    function pin(bookmark) {
      ctx.emit('pin', bookmark)
    }

    return {
      barName,
      confirmDelete,
      onSubmit,
      pin,
      PIN_ENABLED,
      UNKNOWN_BOOKMARK_NAME,
    }
  },
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <BookmarkBarEdit v-model:name="barName" :icon="icon" @icon="$emit('icon')" />

    <ul class="undecorate overflow-h maxw-list px-2 py-1 text-neutral-200">
      <li v-for="bookmark of bookmarks" :key="bookmark.id" class="row items-center no-overflow">
        <span class="flex-auto ellipsis">{{ bookmark.title || (bookmark.type === 'separator' ? '-----' : UNKNOWN_BOOKMARK_NAME) }}</span>
        <button
          v-if="PIN_ENABLED"
          type="button"
          class="btn-icon flex-0 no-bg ml-auto"
          :class="{ active: bookmark.pinned }"
          :disabled="!isActive || bookmark.type === 'separator'"
          :title="!isActive ? i18n.pinButtonInactiveTooltip : bookmark.pinned ? i18n.unpin : i18n.pin"
          @click="pin(bookmark)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" x="0" y="0" viewBox="0 0 512 512">
            <path d="m506.143 175.563c-22.316-22.315-150.052-150.05-169.707-169.705-7.811-7.811-20.475-7.811-28.285 0s-7.81 20.474 0 28.284l14.143 14.143-106.288 106.288c-26.524-5.251-54.055-4.492-80.3 2.287-30.98 8.002-59.374 24.25-82.112 46.989-7.811 7.81-7.81 20.473 0 28.284l98.995 98.995-146.732 146.73c-7.81 7.81-7.81 20.474 0 28.284s20.474 7.811 28.285 0l146.73-146.73 98.994 98.994c3.906 3.906 9.023 5.858 14.143 5.858 5.118 0 10.237-1.953 14.143-5.858 22.737-22.738 38.986-51.132 46.988-82.112 6.779-26.245 7.538-53.775 2.287-80.3l106.289-106.289 14.142 14.142c7.808 7.81 20.473 7.811 28.284 0 7.81-7.81 7.81-20.473.001-28.284zm-184.842 99.989c-5.048 5.048-7.022 12.405-5.181 19.302 11.131 41.68 2.252 86.072-23.134 120.102l-97.967-97.967c-.001-.001-.002-.003-.003-.004s-.002-.002-.004-.003l-97.968-97.968c34.031-25.386 78.424-34.264 120.102-23.134 6.897 1.842 14.254-.132 19.303-5.181l114.13-114.131 84.853 84.852z" />
          </svg>
        </button>
      </li>
    </ul>

    <div class="row">
      <button type="submit" :title="i18n.goBackTooltip" class="btn-icon flex-auto">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="16px" height="16px" x="0" y="0" viewBox="0 0 64 64">
          <path xmlns="http://www.w3.org/2000/svg" d="m54 30h-39.899l15.278-14.552c.8-.762.831-2.028.069-2.828-.761-.799-2.027-.831-2.828-.069l-17.448 16.62c-.755.756-1.172 1.76-1.172 2.829 0 1.068.417 2.073 1.207 2.862l17.414 16.586c.387.369.883.552 1.379.552.528 0 1.056-.208 1.449-.621.762-.8.731-2.065-.069-2.827l-15.342-14.552h39.962c1.104 0 2-.896 2-2s-.896-2-2-2z" />
        </svg>
      </button>
    </div>

    <ConfirmBar class="row" @confirm="$emit('remove')">
      <template #activator="{ on }">
        <button type="button" :title="i18n.delete" class="btn-icon error flex-auto" :disabled="isActive" v-on="on">
          <svg viewBox="0 0 74 74" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg">
            <path d="m52.8 72h-31.6a5.11 5.11 0 0 1 -5.094-4.8l-2.841-47.132a1 1 0 0 1 1-1.06h45.472a1 1 0 0 1 1 1.06l-2.847 47.132a5.11 5.11 0 0 1 -5.09 4.8zm-37.475-50.992 2.781 46.076a3.108 3.108 0 0 0 3.094 2.916h31.6a3.108 3.108 0 0 0 3.1-2.917l2.781-46.076z" />
            <path d="m62.646 21.008h-51.292a1 1 0 0 1 -1-1v-4.237a7.163 7.163 0 0 1 7.155-7.155h38.983a7.163 7.163 0 0 1 7.155 7.155v4.237a1 1 0 0 1 -1.001 1zm-50.293-2h49.293v-3.237a5.161 5.161 0 0 0 -5.155-5.155h-38.983a5.161 5.161 0 0 0 -5.155 5.155z" />
            <path d="m46.232 10.616h-18.464a1 1 0 0 1 -1-1v-3.539a4.082 4.082 0 0 1 4.077-4.077h12.31a4.082 4.082 0 0 1 4.077 4.077v3.539a1 1 0 0 1 -1 1zm-17.464-2h16.464v-2.539a2.079 2.079 0 0 0 -2.077-2.077h-12.31a2.079 2.079 0 0 0 -2.077 2.077z" />
            <path d="m47.065 61.739a1 1 0 0 1 -1-1v-29.577a1 1 0 1 1 2 0v29.577a1 1 0 0 1 -1 1z" />
            <path d="m37 61.739a1 1 0 0 1 -1-1v-29.577a1 1 0 1 1 2 0v29.577a1 1 0 0 1 -1 1z" />
            <path d="m26.935 61.739a1 1 0 0 1 -1-1v-29.577a1 1 0 0 1 2 0v29.577a1 1 0 0 1 -1 1z" />
          </svg>
        </button>
      </template>
    </ConfirmBar>
  </form>
</template>

<style scoped>
.no-overflow {
  overflow: hidden;
}
.overflow-h {
  max-height: 16rem;
  overflow-x: hidden;
  overflow-y: auto;
}
.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
.maxw-list {
  max-width: 240px;
}
#app ul li span {
  font-size: 0.875rem;
}
#app button.no-bg {
  background-color: transparent;
}
#app button.no-bg:disabled {
  color: #757575;
}
#app button.no-bg svg {
  transition: transform 50ms ease-in;
}
#app button.no-bg:hover:not(:disabled) {
  background-color: transparent;
  color: #9bb9df;
}
#app button.no-bg:hover:not(:disabled) svg {
  transform: rotate(-45deg);
}
#app button.no-bg.active {
  color: #9bb9df;
}
#app button.no-bg.active svg {
  transform: rotate(-45deg);
}
#app button.no-bg.active:hover:not(:disabled) {
  color: #6787b1;
}
#app button.no-bg.active:hover:not(:disabled) svg {
  transform: revert;
}
</style>
