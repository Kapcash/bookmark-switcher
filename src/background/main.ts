import { useBookmarkBars } from '@/composables/useBookmarks'
import { copyToFolder, removeFolder } from '@/composables/bookmarkHelper'
import { NEXT_BAR_COMMAND_NAME, TOOLBAR_FOLDER_ID } from '@/logic/constants'
import browser from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

let switchToNextBar = () => { console.warn('Running action before the state is loaded!') }
let switchToBar = (barId: string) => { console.warn('Running action before the state is loaded!') }

useBookmarkBars().then(({ bars: bookmarkBars, currentBar, currentBarIndex }) => {
  // ==== BUTTON ACTION ==== //
  switchToNextBar = () => {
    const nextBarIndex = (currentBarIndex.value + 1) % bookmarkBars.value.length
    console.debug('NEXT BAR', bookmarkBars.value[nextBarIndex].title)
    currentBar.value = bookmarkBars.value[nextBarIndex] || null
  }

  switchToBar = (barId: string) => {
    const targetBar = bookmarkBars.value.find(bar => bar.id === barId)
    currentBar.value = targetBar || null
  }

  // updatePopupIcon(computed(() => currentBar.value?.icon))
})

browser.runtime.onMessage.addListener(({ currentBarId }) => {
  if (currentBarId) {
    switchToBar(currentBarId)
  }
})

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case NEXT_BAR_COMMAND_NAME:
      switchToNextBar()
      break
    default:
      break
  }
})

browser.runtime.onInstalled.addListener(async () => {
})

/** This function enables the sync between the browser toolbar bookmarks
 * and the backup folder of the currently selected toolbar, which holds a copy of the toolbar bookmarks.
 */
function syncToolbarAndCurrentSwitcherFolder (currentBar) {
  browser.bookmarks.onCreated.addListener((newBookmarkId, bookmarkInfos) => {
    const parentIsToolbar = bookmarkInfos.parentId === TOOLBAR_FOLDER_ID
    if (parentIsToolbar) {
      copyToFolder(currentBar.value.id)(bookmarkInfos)
    }
  })

  browser.bookmarks.onRemoved.addListener(async (deletedBookmarkId, removeInfos) => {
    const parentIsToolbar = removeInfos.parentId === TOOLBAR_FOLDER_ID
    if (parentIsToolbar) {
      const duplicateBookmark = await browser.bookmarks.search({
        title: removeInfos.node.title,
        url: removeInfos.node.url,
      })
      const duplicateInSwitcherFolder = duplicateBookmark.find(bookmark => bookmark.parentId === currentBar.value.id)
      if (duplicateInSwitcherFolder) {
        removeFolder(duplicateInSwitcherFolder.id)
      } else {
        console.error(`Can't find the bookmark ${removeInfos.node.title} in the current toolbar folder, can't remove it.`)
      }
    }
  })
}