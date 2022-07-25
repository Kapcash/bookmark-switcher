import { computed } from 'vue'
import { useBookmarkBars } from '@/composables/useBookmarks'
import { updatePopupIcon } from '@/composables/usePopupIcon'

let switchToNextBar = () => { console.warn('Running action before the state is loaded!') }

useBookmarkBars().then(({ bars: bookmarkBars, currentBar, currentBarIndex }) => {
  // ==== BUTTON ACTION ==== //
  switchToNextBar = () => {
    const nextBarIndex = (currentBarIndex.value + 1) % bookmarkBars.value.length
    currentBar.value = bookmarkBars.value[nextBarIndex] || null
  }

  updatePopupIcon(computed(() => currentBar.value?.icon))
})

browser.commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'next_bar':
      switchToNextBar()
      break
    default:
      break
  }
})
