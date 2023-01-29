import { computed } from 'vue'
import { useBookmarkBars } from '@/composables/useBookmarks'
import { updatePopupIcon } from '@/composables/usePopupIcon'
import { NEXT_BAR_COMMAND_NAME } from '@/constants'

let switchToNextBar = () => { console.warn('Running action before the state is loaded!') }
let switchToBar = () => { console.warn('Running action before the state is loaded!') }

useBookmarkBars().then(({ bars: bookmarkBars, currentBar, currentBarIndex }) => {
  // ==== BUTTON ACTION ==== //
  switchToNextBar = () => {
    const nextBarIndex = (currentBarIndex.value + 1) % bookmarkBars.value.length
    console.debug('NEXT BAR', bookmarkBars.value[nextBarIndex].title)
    currentBar.value = bookmarkBars.value[nextBarIndex] || null
  }

  switchToBar = (barId) => {
    const targetBar = bookmarkBars.value.find(bar => bar.id === barId)
    currentBar.value = targetBar || null
  }

  updatePopupIcon(computed(() => currentBar.value?.icon))
})

browser.runtime.onMessage.addListener(({ currentBarId }) => {
  if (currentBarId) {
    switchToBar(currentBarId)
  }
})

browser.commands.onCommand.addListener(function (command) {
  switch (command) {
    case NEXT_BAR_COMMAND_NAME:
      switchToNextBar()
      break
    default:
      break
  }
})
