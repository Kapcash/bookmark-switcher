export const TOOLBAR_FOLDER_ID = process.env.VUE_APP_IS_CHROME === true ? '1' : 'toolbar_____'

export const MENU_BOOKMARK_FOLDER = 'menu________'
export const OTHER_BOOKMARK_FOLDER = 'unfiled_____'

export const TOOLBARS_SWITCHER_NAME = '_BookmarksSwitcher'

/** Get bookmark (folder or not) by title
 * @param {string} title The bookmark title to search for
*/
export function searchBookmarkByTitle (title) {
  return browser.bookmarks.search({ title })
}

export function getBookmarkBId (bookmarkId) {
  return browser.bookmarks.get(bookmarkId).then(res => res[0])
}

/**
 * Update a bookmark toolbar name
 * @param {string} name Toolbar name
 */
export function updateBarName (barId, name) {
  return browser.bookmarks.update(barId, { title: name })
}

/**
 * Create a new bookmark folder
 * @param {string} folderName string The folder name
 * @param {string} parentId The bookmark folder id as parent
 */
export function createBookmarkFolder (folderName, parentId) {
  return browser.bookmarks.create({
    parentId: parentId,
    title: folderName
  })
}

/** Remove a bookmark (folder or not)
 * @param {string} folderId The bookmark id to remove
 */
export function removeFolder (folderId) {
  return browser.bookmarks.removeTree(folderId)
}

/**
 * Switch two bookmark folders childrens
 * @param {string} srcFolderId The source bookmark folder id
 * @param {string} targetFolderId The target bookmark folder id
 */
export async function switchFolders (srcFolderId, targetFolderId) {
  if (!srcFolderId || !targetFolderId) throw new Error('Source or target id is undefined!', srcFolderId, targetFolderId)

  const [srcBookmarks, targetBookmarks] = await Promise.all([getFolderChildrens(srcFolderId), getFolderChildrens(targetFolderId)])
  const moveToSrcFolder = moveToFolder(srcFolderId)
  const moveToTargetFolder = moveToFolder(targetFolderId)
  // Move to src folder before to avoid having a complete empty folder at a moment
  for (const from of targetBookmarks) {
    await moveToSrcFolder(from)
  }
  for (const from of srcBookmarks) {
    await moveToTargetFolder(from)
  }
}

/** Get children bookmarks from a bookmark folder
 * @param {string} folderId The folder id to get childrens from
 */
export function getFolderChildrens (folderId) {
  return browser.bookmarks.getChildren(folderId)
}

export function moveToFolder (targetFolderId) {
  return (bookmark) => browser.bookmarks.move(bookmark.id, { parentId: targetFolderId, index: bookmark.index })
}
