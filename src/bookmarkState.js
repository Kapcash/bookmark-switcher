import { ref } from 'vue'
import {
  TOOLBAR_FOLDER_ID,
  TOOLBARS_SWITCHER_NAME,
  ROOT_BOOKMARK_FOLDER,
  createBookmarkFolder,
  getFolderChildrens,
  switchFolders
} from './bookmarkHelper'

export const CURRENT_BOOKMARK_FOLDER_ID = ref('')
export const MAIN_BOOKMARK_FOLDER = ref('')

const STORAGE_CURRENT_TOOLBAR_ATTR = 'currentToolbar'

export async function getBookmarkBars () {
  CURRENT_BOOKMARK_FOLDER_ID.value = await getCurrentFolderId()

  const barsFolder = await getBookmarkSwitcherFolder()
  if (barsFolder) {
    MAIN_BOOKMARK_FOLDER.value = barsFolder.id
    const folders = await getFolderChildrens(barsFolder.id)

    const folderIds = folders.map(folder => folder.id)
    if (!folderIds.includes(CURRENT_BOOKMARK_FOLDER_ID.value)) {
      resetStorage().then(createAnonymousCurrentBarFolder)
    }

    return folders
  } else {
    throw Error("Can't find extension's bookmark folder. Please restart the extension.")
  }
}

/**
 * Return the current main folder for the extension
 */
export function getBookmarkSwitcherFolder () {
  return browser.bookmarks.search({ title: TOOLBARS_SWITCHER_NAME }).then(res => res[0])
}

export function createBookmarkSwitcherFolder () {
  return createBookmarkFolder(TOOLBARS_SWITCHER_NAME, ROOT_BOOKMARK_FOLDER)
}

export async function createAnonymousCurrentBarFolder () {
  const { id } = await createBookmarkFolder(browser.i18n.getMessage('defaultBarName'), MAIN_BOOKMARK_FOLDER.value)
  updateCurrentFolderId(id)
}

/**
 * Create a new bookmark folder
 * @param folderName string The folder name
 * @param parentId The bookmark folder id as parent
 */
export function createNewBar (folderName) {
  return createBookmarkFolder(folderName, MAIN_BOOKMARK_FOLDER.value).then(({ id }) => updateCurrentFolderId(id))
}

export async function switchToolbar (id) {
  await switchFolders(TOOLBAR_FOLDER_ID, CURRENT_BOOKMARK_FOLDER_ID.value)
  await switchFolders(id, TOOLBAR_FOLDER_ID)
  updateCurrentFolderId(id)
}

/** Store the given id as the current bookmark folder used in the toolbar */
export function updateCurrentFolderId (id) {
  return browser.storage.local.set({
    [STORAGE_CURRENT_TOOLBAR_ATTR]: id
  }).then(() => {
    CURRENT_BOOKMARK_FOLDER_ID.value = id
  })
}

/** Return the current bookmark folder used in the toolbar from storage */
export function getCurrentFolderId () {
  return browser.storage.local.get(STORAGE_CURRENT_TOOLBAR_ATTR).then((storage) => storage[STORAGE_CURRENT_TOOLBAR_ATTR])
}

export function resetStorage () {
  return browser.storage.local.clear()
}
