<template>
  <KeepAlive exclude="BarUpdatePanel">
    <Suspense>
      <component
        :is="panel"
        v-bind="panelProps"
        v-on="panelEvents"
      />

      <template #fallback>
        Loading bookmark bars...
      </template>
    </Suspense>
  </KeepAlive>
</template>

<script>
import { computed, ref, shallowRef } from 'vue'
import BarsList from '@/components/BarsList.vue'
import BarUpdatePanel from '@/components/BarUpdatePanel.vue'
import EmojiPicker from '@/components/EmojiPicker.vue'
import { useBookmarkBars } from '@/composables/useBookmarks'
import { useBrowserStorage } from '@/composables/useBrowserStorage'
import { updatePopupIcon } from '@/composables/usePopupIcon'
import browser from 'webextension-polyfill'

export default {
  name: 'Popup',
  components: { BarsList, BarUpdatePanel },
  async setup () {
    const { bars: bookmarkBars, currentBar, createBar, deleteBar, pinBookmark } = await useBookmarkBars()
    const { useBrowserStorageKey } = useBrowserStorage()
    const excludedBookmarkUrls = await useBrowserStorageKey('pinnedBookmarks')
    updatePopupIcon(computed(() => currentBar.value?.icon))

    const panel = shallowRef(BarsList)
    const panelProps = ref({})
    const panelEvents = ref({})

    function editing (bar) {
      panelProps.value = {
        title: bar.title,
        icon: bar.icon,
        bookmarks: bar.bookmarks,
        isActive: bar.id === currentBar.value?.id,
      }
      panelEvents.value = {
        'update:title': (newTitle) => { bar.title = newTitle },
        icon: () => emoji(bar),
        submit: listing,
        cancel: listing,
        remove: () => {
          deleteBar(bar)
          listing()
        },
        pin: pinBookmark,
      }
      panel.value = BarUpdatePanel
    }

    function listing () {
      panelProps.value = {
        bookmarkBars,
        currentBarId: computed(() => currentBar.value?.id),
      }
      panelEvents.value = {
        create: createBar,
        remove: deleteBar,
        switch: switchBar,
        edit: editing,
      }
      panel.value = BarsList
    }

    function emoji (bar) {
      panelProps.value = {
        modelValue: bar.icon,
      }
      panelEvents.value = {
        'update:modelValue': (newIcon) => {
          console.log('new icon', newIcon)
          bar.icon = newIcon
          editing(bar)
        },
        back: () => editing(bar),
      }
      panel.value = EmojiPicker
    }

    function switchBar (bar) {
      browser.runtime.sendMessage({ currentBarId: bar.id })
    }

    listing()

    return {
      panel,
      panelProps,
      panelEvents,
    }
  },
}
</script>
