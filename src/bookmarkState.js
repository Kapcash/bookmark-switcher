import _throttle from 'lodash.throttle'
import { ref } from 'vue'
import {
  TOOLBAR_FOLDER_ID,
  TOOLBARS_SWITCHER_NAME,
  createBookmarkFolder,
  getFolderChildrens,
  switchFolders,
  moveToFolder,
  getBookmarkBId,
  searchBookmarkByTitle,
  MENU_BOOKMARK_FOLDER,
  removeFolder
} from './bookmarkHelper'

const STORAGE_CURRENT_TOOLBAR_ATTR = 'currentToolbar'

export const CURRENT_BOOKMARK_FOLDER_ID = ref(null)
export const MAIN_BOOKMARK_FOLDER = ref(null)

export async function initState () {
  const barsFolder = await findBookmarkSwitcherFolder()
  if (barsFolder) {
    MAIN_BOOKMARK_FOLDER.value = barsFolder.id
  } else {
    await createBookmarkSwitcherFolder()
  }

  // Retro compatibility between storage.local -> storage.sync
  await migrateLocalStorageToSyncStorage()
  // Retro compatibility from "Bookmarks Menu" -> "Other Bookmarks" folder to store BookmarkSwitcher bars
  await migrateFromMenuToOtherBookmarks()

  const currentFolderId = await getCurrentFolderId()
  if (!currentFolderId) {
    await createAnonymousCurrentBarFolder()
  } else {
    CURRENT_BOOKMARK_FOLDER_ID.value = currentFolderId
  }
}

export async function getBookmarkBars () {
  const folders = await getFolderChildrens(MAIN_BOOKMARK_FOLDER.value)

  const folderIds = folders.map(folder => folder.id)
  if (!folderIds.includes(CURRENT_BOOKMARK_FOLDER_ID.value)) {
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
  return createBookmarkFolder(folderName, MAIN_BOOKMARK_FOLDER.value)
}

export const switchToolbar = _throttle(_switchToolbar, 500, { trailing: false })

async function _switchToolbar (id) {
  await switchFolders(TOOLBAR_FOLDER_ID, CURRENT_BOOKMARK_FOLDER_ID.value)
  await switchFolders(id, TOOLBAR_FOLDER_ID)
  updateCurrentFolderId(id)
  switchToolbar.cancel()
}

export function resetStorage () {
  return browser.storage.sync.clear()
}

/** Store the given id as the current bookmark folder used in the toolbar */
function updateCurrentFolderId (id) {
  return browser.storage.sync.set({
    [STORAGE_CURRENT_TOOLBAR_ATTR]: id
  }).then(() => {
    CURRENT_BOOKMARK_FOLDER_ID.value = id
  })
}

/**
 * Return the current main folder for the extension
 */
function findBookmarkSwitcherFolder () {
  return searchBookmarkByTitle(TOOLBARS_SWITCHER_NAME).then(res => res[0])
}

function createBookmarkSwitcherFolder () {
  return createBookmarkFolder(TOOLBARS_SWITCHER_NAME).then(bookmarkSwitchFolder => {
    MAIN_BOOKMARK_FOLDER.value = bookmarkSwitchFolder.id
    return bookmarkSwitchFolder
  })
}

async function createAnonymousCurrentBarFolder () {
  const { id } = await createBookmarkFolder(browser.i18n.getMessage('defaultBarName'), MAIN_BOOKMARK_FOLDER.value)
  updateCurrentFolderId(id)
}

/** Return the current bookmark folder used in the toolbar from storage */
function getCurrentFolderId () {
  return browser.storage.sync.get(STORAGE_CURRENT_TOOLBAR_ATTR).then((storage) => storage[STORAGE_CURRENT_TOOLBAR_ATTR])
}

async function migrateLocalStorageToSyncStorage () {
  const localCurrentToolbarId = await browser.storage.local.get(STORAGE_CURRENT_TOOLBAR_ATTR).then((storage) => storage[STORAGE_CURRENT_TOOLBAR_ATTR])
  if (localCurrentToolbarId) {
    updateCurrentFolderId(localCurrentToolbarId)
    return browser.storage.local.clear()
  }
}

async function migrateFromMenuToOtherBookmarks () {
  if (process.env.VUE_APP_IS_CHROME === true) {
    return
  }

  const bookmarkSwitcherFolder = await getBookmarkBId(MAIN_BOOKMARK_FOLDER.value)
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
