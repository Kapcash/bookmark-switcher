import _throttle from 'lodash.throttle'
import { ref } from 'vue'
import {
  createBookmarkFolder,
  getFolderChildrens,
  switchFolders,
  moveToFolder,
  getBookmarkBId,
  searchBookmarkByTitle,
  removeFolder
} from './bookmarkHelper'
import {
  TOOLBAR_FOLDER_ID,
  TOOLBARS_SWITCHER_NAME,
  MENU_BOOKMARK_FOLDER,
  STORAGE_CURRENT_TOOLBAR_ATTR,
  STORAGE_EXCLUDED_BOOKMARK_ATTR
} from './constants'
import { useBrowserStorage } from './composables/useBookmarkStorage'

export let currentBookmarkFolderId = ref(null)
export const mainBookmarkFolder = ref(null)
export let excludedBookmarkIds = ref([])

export async function initState () {
  const barsFolder = await findBookmarkSwitcherFolder()
  if (barsFolder) {
    mainBookmarkFolder.value = barsFolder.id
  } else {
    await createBookmarkSwitcherFolder()
  }

  // Retro compatibility between storage.local -> storage.sync
  await migrateLocalStorageToSyncStorage()
  // Retro compatibility from "Bookmarks Menu" -> "Other Bookmarks" folder to store BookmarkSwitcher bars
  await migrateFromMenuToOtherBookmarks()

  const { useBrowserStorageKey } = useBrowserStorage()
  currentBookmarkFolderId = await useBrowserStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)

  // const currentFolderId = await getStorageKey(STORAGE_CURRENT_TOOLBAR_ATTR)
  if (!currentBookmarkFolderId.value) {
    await createAnonymousCurrentBarFolder()
  }

  excludedBookmarkIds = await useBrowserStorageKey(STORAGE_EXCLUDED_BOOKMARK_ATTR)
}

export async function getBookmarkBars () {
  const folders = await getFolderChildrens(mainBookmarkFolder.value)

  const folderIds = folders.map(folder => folder.id)
  if (!folderIds.includes(currentBookmarkFolderId.value)) {
    resetStorage().then(createAnonymousCurrentBarFolder)
  }

  return folders
}

/**
 * Create a new bookmark folder
 * @param folderName string The folder name
 * @param parentId The bookmark folder id as parent
 */
export function createNewBar (folderName) {
  return createBookmarkFolder(folderName, mainBookmarkFolder.value)
}

export const switchToolbar = _throttle(_switchToolbar, 500, { trailing: false })

async function _switchToolbar (id) {
  await switchFolders(TOOLBAR_FOLDER_ID, currentBookmarkFolderId.value, excludedBookmarkIds.value)
  await switchFolders(id, TOOLBAR_FOLDER_ID, excludedBookmarkIds.value)
  updateCurrentFolderId(id)
  switchToolbar.cancel()
}

export function resetStorage () {
  return browser.storage.sync.clear()
}

/** Store the given id as the current bookmark folder used in the toolbar */
function updateCurrentFolderId (id) {
  currentBookmarkFolderId.value = id
}

/** Return the current main folder for the extension */
function findBookmarkSwitcherFolder () {
  return searchBookmarkByTitle(TOOLBARS_SWITCHER_NAME).then(res => res[0])
}

function createBookmarkSwitcherFolder () {
  return createBookmarkFolder(TOOLBARS_SWITCHER_NAME).then(bookmarkSwitchFolder => {
    mainBookmarkFolder.value = bookmarkSwitchFolder.id
    return bookmarkSwitchFolder
  })
}

async function createAnonymousCurrentBarFolder () {
  const { id } = await createBookmarkFolder(browser.i18n.getMessage('defaultBarName'), mainBookmarkFolder.value)
  updateCurrentFolderId(id)
}

/** ===== RETRO COMPATIBILITY METHODS ===== */

async function migrateLocalStorageToSyncStorage () {
  const localCurrentToolbarId = await browser.storage.local.get(STORAGE_CURRENT_TOOLBAR_ATTR).then((storage) => storage[STORAGE_CURRENT_TOOLBAR_ATTR])
  if (localCurrentToolbarId) {
    updateCurrentFolderId(localCurrentToolbarId)
    return browser.storage.local.clear()
  }
}

async function migrateFromMenuToOtherBookmarks () {
  if (process.env.VUE_APP_IS_CHROME === 'true') {
    return
  }

  const bookmarkSwitcherFolder = await getBookmarkBId(mainBookmarkFolder.value)
  if (bookmarkSwitcherFolder.parentId === MENU_BOOKMARK_FOLDER) {
    const newMainFolder = await createBookmarkSwitcherFolder()

    const moveToNewMainFolder = moveToFolder(newMainFolder.id)
    const barsToMove = await getFolderChildrens(bookmarkSwitcherFolder.id)
    for (const barToMove of barsToMove) {
      await moveToNewMainFolder(barToMove)
    }

    await removeFolder(bookmarkSwitcherFolder.id)
  }
}
