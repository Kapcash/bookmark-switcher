import { useBookmarkBars } from '@/composables/useBookmarks'

const { bars: bookmarkBars, currentBar, currentBarIndex } = useBookmarkBars()

// ==== BUTTON ACTION ==== //
async function switchToNextBar () {
  const nextBarIndex = (currentBarIndex + 1) % bookmarkBars.value.length
  currentBar.value = bookmarkBars[nextBarIndex] || null
}

browser.commands.onCommand.addListener(function (command) {
  switch (command) {
    case 'next_bar':
      switchToNextBar()
      break
    default:
      break
  }
})
