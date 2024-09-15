import { ref, reactive, readonly, watch, computed } from 'vue'
import _throttle from 'lodash.throttle'
import browser from 'webextension-polyfill'
import { useBrowserStorage } from './useBrowserStorage'
import { TOOLBAR_FOLDER_ID, TOOLBARS_SWITCHER_NAME, STORAGE_CURRENT_TOOLBAR_ATTR, OPTION_KEY_SYNC_BAR } from '@/logic/constants'
import { updateBarName, removeFolder, switchFolders, searchBookmarkByTitle, getFolderChildrens, createBookmarkFolder } from './bookmarkHelper'

const switcherFolderPromise = searchBookmarkByTitle(TOOLBARS_SWITCHER_NAME).then(res => res[0])

export async function useBookmarkBars () {
  const { useBrowserStorageKey, resetStorage } = useBrowserStorage()
  const syncCurrentBar = await useBrowserStorageKey(OPTION_KEY_SYNC_BAR, true)
  const barIcons = await useBrowserStorageKey('barIcons')
  const excludedBookmarkIds = await useBrowserStorageKey('pinnedBookmarks')

  let currentBookmarkFolderId
  if (!syncCurrentBar.value) {
    const { useBrowserStorageKey: useLocalBrowserStorageKey } = useBrowserStorage(false)
    currentBookmarkFolderId = await useLocalBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)
  } else {
    currentBookmarkFolderId = await useBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)
  }

  // Loads main wrapper folder for bookmark bars
  const switcherFolder = await switcherFolderPromise.then((folder) => {
    return folder || createBookmarkFolder(TOOLBARS_SWITCHER_NAME)
  })

  const barFolders = await getFolderChildrens(switcherFolder.id)
    .then(folders =>
      Promise.all(folders.map(folder => useBookmarkFolder(barIcons, excludedBookmarkIds)(folder, folder.id === currentBookmarkFolderId.value ? TOOLBAR_FOLDER_ID : undefined))),
    )
    .catch(err => {
      console.error('An error happened while fetching current bars', err)
      throw err
    })

  const bars = ref(barFolders)

  browser.bookmarks.onCreated.addListener((newBookmarkId, bookmarkInfos) => {
    const isFolder = bookmarkInfos.type === 'folder' || !('url' in bookmarkInfos)
    const parentIsSwitcherFolder = bookmarkInfos.parentId === switcherFolder.id
    const folderNotAlreadyAdded = bars.value.every(bar => bar.id !== newBookmarkId)

    if (isFolder && parentIsSwitcherFolder && folderNotAlreadyAdded) {
      useBookmarkFolder(barIcons, excludedBookmarkIds)(bookmarkInfos, undefined).then(newFolder => {
        bars.value.push(newFolder)
      })
    }
  })

  browser.bookmarks.onRemoved.addListener((deletedBookmarkId, removeInfos) => {
    if (removeInfos.parentId === switcherFolder.id) {
      deleteBar(deletedBookmarkId)
    }
  })

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
      .catch(err => {
        console.error('An error occurred while creating a new bar', err)
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

  let changedBarFromExternalScript = false

  watch(currentBookmarkFolderId, (newCurrentId) => {
    changedBarFromExternalScript = newCurrentId !== currentBar.value?.id
    if (changedBarFromExternalScript) {
      currentBar.value = bars.value.find(bar => bar.id === newCurrentId)
    }
  })

  watch(currentBar, async (newBar, oldBar) => {
    if (oldBar && !changedBarFromExternalScript) {
      if (newBar) {
        await switchToolbar(oldBar.id, newBar.id)
      } else {
        // Setting current to null -> rollback to previous value
        currentBar.value = oldBar
      }
    }
    currentBookmarkFolderId.value = newBar?.id || null
    changedBarFromExternalScript = false
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
    .catch(err => {
      console.error("Error while fetching childrens", err)
      throw err
    })
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
