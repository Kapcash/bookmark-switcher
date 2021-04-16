import { ref } from 'vue'

const TOOLBAR_FOLDER_ID = 'toolbar_____'
const TOOLBARS_SWITCHER_NAME = '_BookmarksSwitcher'
export const CURRENT_BOOKMARK_FOLDER_ID = ref('')
export const TOOLBARS_SWITCHER_ID = ref('')

export function getBookmarkSwitcherFolder () {
  return browser.bookmarks.search({ title: TOOLBARS_SWITCHER_NAME })
}

export async function getBookmarkBars () {
  CURRENT_BOOKMARK_FOLDER_ID.value = await getCurrentFolderId()

  const [barsFolder] = await getBookmarkSwitcherFolder()
  if (barsFolder) {
    TOOLBARS_SWITCHER_ID.value = barsFolder.id
    return getFolderChildrens(barsFolder.id)
  } else {
    throw Error("Can't find extension's bookmark folder. Please restart the extension.")
  }
}

/**
 * Update a bookmark toolbar name
 * @param name Toolbar name
 */
export function updateBarName (barId, name) {
  return browser.bookmarks.update(barId, { title: name })
}

/**
 * Create a new bookmark folder
 * @param folderName string The folder name
 * @param parentId The bookmark folder id as parent
 */
export function createFolder (folderName, parentId = TOOLBARS_SWITCHER_ID.value) {
  return browser.bookmarks.create({
    parentId: parentId,
    title: folderName,
    type: 'folder'
  })
}

export function removeFolder (folderId) {
  return browser.bookmarks.removeTree(folderId)
}

export async function switchToolbar (id) {
  await switchFolders(TOOLBAR_FOLDER_ID, CURRENT_BOOKMARK_FOLDER_ID.value)
  await switchFolders(id, TOOLBAR_FOLDER_ID)
  setCurrentFolderId(id)
}

async function switchFolders (srcFolderId, targetFolderId) {
  if (!srcFolderId || !targetFolderId) throw new Error('Source or targed id is undefined!', srcFolderId, targetFolderId)
  const [srcBookmarks, targetBookmarks] = await Promise.all([getFolderChildrens(srcFolderId), getFolderChildrens(targetFolderId)])
  // We have to await all to avoid concurrency move in a same folder -> indexes are messed up with such concurrency!
  await Promise.all(targetBookmarks.map(moveToFolder(srcFolderId))) // Move to src folder before to avoid having a complete empty folder at a moment
  await Promise.all(srcBookmarks.map(moveToFolder(targetFolderId)))
}

function getFolderChildrens (folderId) {
  return browser.bookmarks.getChildren(folderId)
}

function moveToFolder (targetFolderId) {
  return (bookmark) => browser.bookmarks.move(bookmark.id, { parentId: targetFolderId })
}

export function setCurrentFolderId (id) {
  browser.storage.local.set({
    currentToolbar: id
  })
  CURRENT_BOOKMARK_FOLDER_ID.value = id
}

export function getCurrentFolderId (id) {
  return browser.storage.local.get('currentToolbar').then(({ currentToolbar }) => currentToolbar)
}
