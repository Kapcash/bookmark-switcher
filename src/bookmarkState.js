import { ref } from 'vue'
import {
  TOOLBAR_FOLDER_ID,
  TOOLBARS_SWITCHER_NAME,
  ROOT_BOOKMARK_FOLDER,
  createBookmarkFolder,
  getFolderChildrens,
  switchFolders,
  setCurrentFolderId,
  getCurrentFolderId
} from './bookmarkHelper'

export const CURRENT_BOOKMARK_FOLDER_ID = ref('')
export const TOOLBARS_SWITCHER_ID = ref('')

export async function getBookmarkBars () {
  CURRENT_BOOKMARK_FOLDER_ID.value = await getCurrentFolderId()

  const barsFolder = await getBookmarkSwitcherFolder()
  if (barsFolder) {
    TOOLBARS_SWITCHER_ID.value = barsFolder.id
    return getFolderChildrens(barsFolder.id)
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

/**
 * Create a new bookmark folder
 * @param folderName string The folder name
 * @param parentId The bookmark folder id as parent
 */
export function createNewBar (folderName) {
  return createBookmarkFolder(folderName, TOOLBARS_SWITCHER_ID.value).then(({ id }) => setCurrentFolderId(id))
}

export async function switchToolbar (id) {
  await switchFolders(TOOLBAR_FOLDER_ID, CURRENT_BOOKMARK_FOLDER_ID.value)
  await switchFolders(id, TOOLBAR_FOLDER_ID)
  updateCurrentFolderId(id)
}

export async function updateCurrentFolderId (id) {
  await setCurrentFolderId(id)
  CURRENT_BOOKMARK_FOLDER_ID.value = id
}
