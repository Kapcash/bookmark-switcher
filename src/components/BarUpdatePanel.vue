<template>
  <form @submit.prevent="onSubmit">
    <BookmarkBarEdit v-model:name="barName" :icon="icon" @icon="$emit('icon')" />

    <ul class="undecorate pl-16 overflow-h">
      <li v-for="bookmark of bookmarks" :key="bookmark.id" class="row align-baseline no-overflow">
        <span class="flex ellipsis">{{ bookmark.title }}</span>
        <button type="button" class="btn-icon flex-0 no-bg" :class="{ active: bookmark.pinned }" @click="pin(bookmark)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" x="0" y="0" viewBox="0 0 512 512">
            <path d="m506.143 175.563c-22.316-22.315-150.052-150.05-169.707-169.705-7.811-7.811-20.475-7.811-28.285 0s-7.81 20.474 0 28.284l14.143 14.143-106.288 106.288c-26.524-5.251-54.055-4.492-80.3 2.287-30.98 8.002-59.374 24.25-82.112 46.989-7.811 7.81-7.81 20.473 0 28.284l98.995 98.995-146.732 146.73c-7.81 7.81-7.81 20.474 0 28.284s20.474 7.811 28.285 0l146.73-146.73 98.994 98.994c3.906 3.906 9.023 5.858 14.143 5.858 5.118 0 10.237-1.953 14.143-5.858 22.737-22.738 38.986-51.132 46.988-82.112 6.779-26.245 7.538-53.775 2.287-80.3l106.289-106.289 14.142 14.142c7.808 7.81 20.473 7.811 28.284 0 7.81-7.81 7.81-20.473.001-28.284zm-184.842 99.989c-5.048 5.048-7.022 12.405-5.181 19.302 11.131 41.68 2.252 86.072-23.134 120.102l-97.967-97.967c-.001-.001-.002-.003-.003-.004s-.002-.002-.004-.003l-97.968-97.968c34.031-25.386 78.424-34.264 120.102-23.134 6.897 1.842 14.254-.132 19.303-5.181l114.13-114.131 84.853 84.852z"></path>
          </svg>
        </button>
      </li>
    </ul>

    <div class="row">
      <button type="submit" title="Update" class="btn-icon success flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -65 434.67733 434" height="16px" width="16px">
          <path d="m152.003906 304.34375c-5.460937 0-10.921875-2.089844-15.082031-6.25l-130.664063-130.667969c-8.34375-8.339843-8.34375-21.824219 0-30.164062 8.339844-8.339844 21.820313-8.339844 30.164063 0l115.582031 115.582031 246.253906-246.25c8.339844-8.339844 21.820313-8.339844 30.164063 0 8.339844 8.34375 8.339844 21.824219 0 30.167969l-261.332031 261.332031c-4.160156 4.160156-9.625 6.25-15.085938 6.25zm0 0"/>
        </svg>
      </button>
    </div>

    <ConfirmBar class="row" @confirm="$emit('remove')">
      <template #activator="{ on }">
        <button type="button" :title="removeTooltip" class="btn-icon error flex" :disabled="isActive" v-on="on">
          <svg viewBox="0 0 74 74" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg">
            <path d="m52.8 72h-31.6a5.11 5.11 0 0 1 -5.094-4.8l-2.841-47.132a1 1 0 0 1 1-1.06h45.472a1 1 0 0 1 1 1.06l-2.847 47.132a5.11 5.11 0 0 1 -5.09 4.8zm-37.475-50.992 2.781 46.076a3.108 3.108 0 0 0 3.094 2.916h31.6a3.108 3.108 0 0 0 3.1-2.917l2.781-46.076z"/>
            <path d="m62.646 21.008h-51.292a1 1 0 0 1 -1-1v-4.237a7.163 7.163 0 0 1 7.155-7.155h38.983a7.163 7.163 0 0 1 7.155 7.155v4.237a1 1 0 0 1 -1.001 1zm-50.293-2h49.293v-3.237a5.161 5.161 0 0 0 -5.155-5.155h-38.983a5.161 5.161 0 0 0 -5.155 5.155z"/>
            <path d="m46.232 10.616h-18.464a1 1 0 0 1 -1-1v-3.539a4.082 4.082 0 0 1 4.077-4.077h12.31a4.082 4.082 0 0 1 4.077 4.077v3.539a1 1 0 0 1 -1 1zm-17.464-2h16.464v-2.539a2.079 2.079 0 0 0 -2.077-2.077h-12.31a2.079 2.079 0 0 0 -2.077 2.077z"/>
            <path d="m47.065 61.739a1 1 0 0 1 -1-1v-29.577a1 1 0 1 1 2 0v29.577a1 1 0 0 1 -1 1z"/>
            <path d="m37 61.739a1 1 0 0 1 -1-1v-29.577a1 1 0 1 1 2 0v29.577a1 1 0 0 1 -1 1z"/>
            <path d="m26.935 61.739a1 1 0 0 1 -1-1v-29.577a1 1 0 0 1 2 0v29.577a1 1 0 0 1 -1 1z"/>
          </svg>
        </button>
      </template>
    </ConfirmBar>
  </form>
</template>

<script>
import BookmarkBarEdit from '@/components/BookmarkBarEdit.vue'
import ConfirmBar from '@/components/ConfirmBar.vue'
import { ref } from 'vue'

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
  setup (props, ctx) {
    const barName = ref(props.title)
    const confirmDelete = ref(false)

    function onSubmit () {
      ctx.emit('update:title', barName.value)
      ctx.emit('submit')
    }

    function pin (bookmark) {
      ctx.emit('pin', bookmark.id)
    }

    return {
      barName,
      confirmDelete,
      onSubmit,
      pin,
      selectBarTitle: browser.i18n.getMessage('selectBar'),
      removeTooltip: browser.i18n.getMessage('delete'),
      renameTooltip: browser.i18n.getMessage('rename'),
    }
  },
}
</script>

<style scoped>
.no-overflow {
  overflow: hidden;
}
.overflow-h {
  max-height: 8rem;
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 10px;
}
.ellipsis {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 200px;
}
.pl-16 {
  padding-left: 16px;
}
.no-bg {
  background-color: transparent;
}
.no-bg svg {
  transition: transform 50ms ease-in;
}
.no-bg:hover {
  background-color: transparent;
  color: #9bb9df;
}
.no-bg:hover svg {
  transform: rotate(-45deg);
}
.no-bg.active {
  color: #9bb9df;
}
.no-bg.active svg {
  transform: rotate(-45deg);
}
.no-bg.active:hover {
  color: #6787b1;
}
.no-bg.active:hover svg {
  transform: revert;
}
</style>
