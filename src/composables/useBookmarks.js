import { ref, reactive, readonly, watch, computed } from 'vue'
import _throttle from 'lodash.throttle'
import { useBrowserStorage } from './useBrowserStorage'
import { TOOLBAR_FOLDER_ID, TOOLBARS_SWITCHER_NAME, STORAGE_CURRENT_TOOLBAR_ATTR } from '../constants'
import { updateBarName, removeFolder, switchFolders, searchBookmarkByTitle, getFolderChildrens, createBookmarkFolder } from '../bookmarkHelper'

const switcherFolderPromise = searchBookmarkByTitle(TOOLBARS_SWITCHER_NAME).then(res => res[0])

export async function useBookmarkBars () {
  const { useBrowserStorageKey, resetStorage } = useBrowserStorage()
  const currentBookmarkFolderId = await useBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)
  const barIcons = await useBrowserStorageKey('barIcons')
  const excludedBookmarkIds = await useBrowserStorageKey('pinnedBookmarks')

  // Loads main wrapper folder for bookmark bars
  const switcherFolder = await switcherFolderPromise.then((folder) => {
    return folder || createBookmarkFolder(TOOLBARS_SWITCHER_NAME)
  })

  const barFolders = await getFolderChildrens(switcherFolder.id).then(folders =>
    Promise.all(folders.map(folder => useBookmarkFolder(barIcons, excludedBookmarkIds)(folder, folder.id === currentBookmarkFolderId.value ? TOOLBAR_FOLDER_ID : undefined))),
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

  function deleteBar ({ id: barId }) {
    const barIndex = bars.value.findIndex(bar => bar.id === barId)
    if (barIndex >= 0) {
      return removeFolder(bars.value[barIndex].id).then(() => {
        bars.value.splice(barIndex, 1)
      })
    }
  }

  function createBar (barName) {
    return createBookmarkFolder(barName, switcherFolder.id)
      .then(useBookmarkFolder(barIcons, excludedBookmarkIds))
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
      console.error('Error switching bars from ', fromId, ' to ', targetId, err)
    }
    switchToolbar.cancel()
  }

  const currentBarIndex = computed(() => {
    return bars.value.findIndex(bar => bar.id === currentBar.value.id)
  })

  watch(currentBar, (newBar, oldBar) => {
    if (oldBar) {
      if (newBar) {
        switchToolbar(oldBar.id, newBar.id)
      } else {
        // Setting current to null -> rollback to previous value
        currentBar.value = oldBar
      }
    }
    currentBookmarkFolderId.value = newBar?.id || null
  })

  return {
    bars,
    currentBar,
    currentBarIndex,
    deleteBar,
    createBar,
  }
}

const useBookmarkFolder = (storedIcons, excludedBookmarkIds) => async (bookmarkFolder, childrensParentId) => {
  const childrenBookmarks = await getFolderChildrens(childrensParentId || bookmarkFolder.id)
    .then(childrens => childrens.map(children => ({
      ...children,
      pinned: computed(() => excludedBookmarkIds.value?.some(excludedId => excludedId === children.id)),
    })))
  const bar = reactive({
    ...bookmarkFolder,
    bookmarks: readonly(childrenBookmarks),
    icon: storedIcons.value?.[bookmarkFolder.id] || null,
  })

  watch(() => bar.title, (newName) => {
    updateBarName(bar.id, newName)
  })

  watch(() => bar.icon, (newIcon) => {
    storedIcons.value = { ...storedIcons.value, [bar.id]: newIcon }
  })

  return bar
}
