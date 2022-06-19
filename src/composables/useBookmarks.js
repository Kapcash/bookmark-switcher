import { ref, reactive, readonly, toRef, watch, computed } from 'vue'
import _throttle from 'lodash.throttle'
import { useBrowserStorage } from './useBrowserStorage'
import { TOOLBAR_FOLDER_ID, TOOLBARS_SWITCHER_NAME, STORAGE_CURRENT_TOOLBAR_ATTR } from '../constants'
import { updateBarName, removeFolder, switchFolders, searchBookmarkByTitle, getFolderChildrens, createBookmarkFolder } from '../bookmarkHelper'

const switcherFolderPromise = searchBookmarkByTitle(TOOLBARS_SWITCHER_NAME).then(res => res[0])

export async function useBookmarkBars () {
  const excludedBookmarkIds = ref([]) // TODO load
  const { useBrowserStorageKey, resetStorage } = useBrowserStorage()
  const currentBookmarkFolderId = await useBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)

  // Loads main wrapper folder for bookmark bars
  const switcherFolder = await switcherFolderPromise.then((folder) => {
    return folder || createBookmarkFolder(TOOLBARS_SWITCHER_NAME)
  })

  const barFolders = await getFolderChildrens(switcherFolder.id).then(folders =>
    Promise.all(folders.map(folder => useBookmarkFolder(folder)))
  )
  const bars = ref(barFolders)

  const current = bars.value.find(bar => bar.id === currentBookmarkFolderId.value)
  const currentBar = ref(current)
  if (!current) {
    resetStorage().then(createAnonymousCurrentBarFolder)
  }

  async function createAnonymousCurrentBarFolder () {
    const anonymousName = browser.i18n.getMessage('defaultBarName')
    currentBar.value = await createBar(anonymousName)
  }

  function deleteBar (barId) {
    const barIndex = bars.value.findIndex(bar => bar.id === barId)
    if (barIndex >= 0) {
      return removeFolder(bars.value[barIndex].id).then(() => {
        bars.value.splice(barIndex, 1)
      })
    }
  }

  function createBar (barName) {
    return createBookmarkFolder(barName, switcherFolder.id)
      .then(useBookmarkFolder)
      .then(newBar => {
        bars.value.push(newBar)
        return newBar
      })
  }

  const switchToolbar = _throttle(_switchToolbar, 500, { trailing: false })
  async function _switchToolbar (fromId, targetId) {
    try {
      await switchFolders(TOOLBAR_FOLDER_ID, fromId, excludedBookmarkIds.value)
      await switchFolders(targetId, TOOLBAR_FOLDER_ID, excludedBookmarkIds.value)
    } catch (err) {
      console.error('Error switching bars from ', fromId, ' to ', targetId)
    }
    switchToolbar.cancel()
  }

  const currentBarIndex = computed(() => {
    return this.bars.value.findIndex(bar => bar.id === this.currentBar.value.id)
  })

  watch(currentBar, (newBar, oldBar) => {
    console.log('currentBar updated', oldBar, '->', newBar)
    if (oldBar) {
      if (newBar) {
        switchToolbar(oldBar.id, newBar.id)
      } else {
        // Setting current to null -> rollback to previous value
        currentBar.value = oldBar
      }
    }
    currentBookmarkFolderId.value = newBar?.id || null
    console.log('currentBookmarkFolderId', currentBookmarkFolderId.value, 'newBar', newBar?.id, oldBar?.id)
  })

  return {
    bars,
    currentBar,
    currentBarIndex,
    deleteBar,
    createBar
  }
}

export async function useBookmarkFolder (bookmarkFolder) {
  const childrenBookmarks = await getFolderChildrens(bookmarkFolder.id)
  const bar = reactive({
    ...bookmarkFolder,
    bookmarks: readonly(childrenBookmarks)
  })

  watch(toRef(bar.title), (newName) => {
    updateBarName(bar.id, newName)
  })

  return bar
}
