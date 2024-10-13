import { ref, reactive, readonly, watch, computed } from 'vue'
import _throttle from 'lodash.throttle'
import browser from 'webextension-polyfill'
import { useBrowserStorage } from './useBrowserStorage'
import { TOOLBAR_FOLDER_ID, TOOLBARS_SWITCHER_NAME, STORAGE_CURRENT_TOOLBAR_ATTR, OPTION_KEY_SYNC_BAR } from '@/logic/constants'
import { updateBarName, removeFolder, switchFolders, searchBookmarkByTitle, getFolderChildren, createBookmarkFolder, copyToFolder, removeAllChildren, setAllChildrenFromTo } from './bookmarkHelper'

const switcherFolderPromise = searchBookmarkByTitle(TOOLBARS_SWITCHER_NAME).then(res => res[0])

export async function useBookmarkBars () {
  const { useBrowserStorageKey, resetStorage } = useBrowserStorage()
  const syncCurrentBar = await useBrowserStorageKey(OPTION_KEY_SYNC_BAR, true)
  const barIcons = await useBrowserStorageKey('barIcons')
  const excludedBookmarkIds = await useBrowserStorageKey('pinnedBookmarks')

  let currentBookmarkFolderId
  if (syncCurrentBar.value) {
    currentBookmarkFolderId = await useBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)
  } else {
    const { useBrowserStorageKey: useLocalBrowserStorageKey } = useBrowserStorage(false)
    currentBookmarkFolderId = await useLocalBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)
  }

  // Loads main wrapper folder for bookmark bars
  const switcherFolder = await switcherFolderPromise.then((folder) => {
    return folder || createBookmarkFolder(TOOLBARS_SWITCHER_NAME)
  })

  const barFolders = await getFolderChildren(switcherFolder.id)
    .then(folders =>
      Promise.all(folders.map(folder => useBookmarkFolder(barIcons, excludedBookmarkIds)(folder, folder.id === currentBookmarkFolderId.value ? TOOLBAR_FOLDER_ID : undefined))),
    )
    .catch(err => {
      console.error('An error happened while fetching current bars', err)
      throw err
    })

  const bars = ref(barFolders)
  const current = bars.value.find(bar => bar.id === currentBookmarkFolderId.value)
  const currentBar = ref(current)
  let changedBarFromExternalScript = false

  // ===== BROWSER LISTENERS ===== //

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

  // ===== FUNCTIONS ===== //

  function deleteBar ({ id: barId }) {
    const barIndex = bars.value.findIndex(bar => bar.id === barId)
    if (barIndex >= 0) {
      return removeFolder(bars.value[barIndex].id).then(() => {
        bars.value.splice(barIndex, 1)
      })
    }
  }

  function createAnonymousCurrentBarFolder () {
    const anonymousName = browser.i18n.getMessage('defaultBarName') || '🔖'
    return createBar(anonymousName, TOOLBAR_FOLDER_ID)
  }


  async function createBar (barName, copyFrom) {
    try {
      const newFolder = await createBookmarkFolder(barName, switcherFolder.id)

      if (copyFrom) {
        const children = await getFolderChildren(copyFrom)
        const copyToTargetFolder = copyToFolder(newFolder.id)
        for(const bookmark of children) {
          await copyToTargetFolder(bookmark)
        }
      }
  
      return useBookmarkFolder(barIcons, excludedBookmarkIds)(newFolder)
    } catch(err) {
      console.error('An error occurred while creating a new bar', err)
    }
  }

  const switchToolbar = _throttle(_switchToolbar, 500, { trailing: false })
  async function _switchToolbar (fromId, targetId) {
    try {
      // Remove all backup of current toolbar
      await removeAllChildren(currentBookmarkFolderId.value)
      // Copy all current toolbar to backup folder (i.e. update the toolbar backup)
      await setAllChildrenFromTo(TOOLBAR_FOLDER_ID, currentBookmarkFolderId.value)
      // Copy all selected bar to toolbar
      await setAllChildrenFromTo(targetId, TOOLBAR_FOLDER_ID)
    } catch (err) {
      console.error('Error switching bars from ', fromId, ' to ', targetId, err)
    }
    switchToolbar.cancel()
  }

  // ===== WATCHERS ===== //

  const currentBarIndex = computed(() => {
    return bars.value.findIndex(bar => bar.id === currentBar.value.id)
  })

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

  // ===== LOGIC ===== //

  if (!current) {
    await resetStorage()
    currentBar.value = await createAnonymousCurrentBarFolder()
  }

  return {
    bars,
    currentBar,
    currentBarIndex,
    deleteBar,
    createBar,
  }
}

const useBookmarkFolder = (storedIcons, excludedBookmarkIds) => async (bookmarkFolder, childrensParentId) => {
  const childrenBookmarks = await getFolderChildren(childrensParentId || bookmarkFolder.id)
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
