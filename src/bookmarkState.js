import _throttle from 'lodash.throttle'
import { ref } from 'vue'
import {
  TOOLBAR_FOLDER_ID,
  TOOLBARS_SWITCHER_NAME,
  ROOT_BOOKMARK_FOLDER,
  createBookmarkFolder,
  getFolderChildrens,
  switchFolders
} from './bookmarkHelper'

const STORAGE_CURRENT_TOOLBAR_ATTR = 'currentToolbar'

export const CURRENT_BOOKMARK_FOLDER_ID = ref(null)
export const MAIN_BOOKMARK_FOLDER = ref(null)

export async function initState () {
  const barsFolder = await getBookmarkSwitcherFolder()
  if (barsFolder) {
    MAIN_BOOKMARK_FOLDER.value = barsFolder.id
  } else {
    await createBookmarkSwitcherFolder()
  }

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
  return createBookmarkFolder(folderName, MAIN_BOOKMARK_FOLDER.value).then(({ id }) => updateCurrentFolderId(id))
}

export const switchToolbar = _throttle(_switchToolbar, 500, { trailing: false })

async function _switchToolbar (id) {
  await switchFolders(TOOLBAR_FOLDER_ID, CURRENT_BOOKMARK_FOLDER_ID.value)
  await switchFolders(id, TOOLBAR_FOLDER_ID)
  updateCurrentFolderId(id)
  switchToolbar.cancel()
}

export function resetStorage () {
  return browser.storage.local.clear()
}

/** Store the given id as the current bookmark folder used in the toolbar */
function updateCurrentFolderId (id) {
  return browser.storage.local.set({
    [STORAGE_CURRENT_TOOLBAR_ATTR]: id
  }).then(() => {
    CURRENT_BOOKMARK_FOLDER_ID.value = id
  })
}

/**
 * Return the current main folder for the extension
 */
function getBookmarkSwitcherFolder () {
  return browser.bookmarks.search({ title: TOOLBARS_SWITCHER_NAME }).then(res => res[0])
}

function createBookmarkSwitcherFolder () {
  return createBookmarkFolder(TOOLBARS_SWITCHER_NAME, ROOT_BOOKMARK_FOLDER)
}

async function createAnonymousCurrentBarFolder () {
  const { id } = await createBookmarkFolder(browser.i18n.getMessage('defaultBarName'), MAIN_BOOKMARK_FOLDER.value)
  updateCurrentFolderId(id)
}

/** Return the current bookmark folder used in the toolbar from storage */
function getCurrentFolderId () {
  return browser.storage.local.get(STORAGE_CURRENT_TOOLBAR_ATTR).then((storage) => storage[STORAGE_CURRENT_TOOLBAR_ATTR])
}
