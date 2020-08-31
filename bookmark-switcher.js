const ROOT_FOLDER_ID = 'root_____';
const MENU_FOLDER_ID = 'menu________';
const TOOLBAR_FOLDER_ID = 'toolbar_____';
const TOOLBARS_SWITCHER_NAME = '_BookmarksSwitcher';
let TOOLBARS_SWITCHER_ID;
let bookmarkToolbarsFolders = []

const TOOLBAR_NAME_PREFIX = 'bookmark-switcher';

let nbToolbars = 0;

/** Get all bookmarks of a folder */
function getFolderChildrens(folderId) {
  return browser.bookmarks.getChildren(folderId);
}

/** Switch bookmarks between two folders */
function switchFolders(srcFolderId, targetFolderId) {
  return Promise.all([getFolderChildrens(srcFolderId), getFolderChildrens(targetFolderId)]).then((results) => {
    const [srcBookmarks, targetBookmarks] = results;
    for (const src of srcBookmarks) {
      browser.bookmarks.move(src.id, { parentId: targetFolderId });
    }
    for (const target of targetBookmarks) {
      browser.bookmarks.move(target.id, { parentId: srcFolderId });
    }
  });
}

/** Create a new bookmark folder
 * @param folderName string The folder name
 * @param parentId The bookmark folder id as parent
 */
function createFolder(folderName, parentId = MENU_FOLDER_ID) {
  return browser.bookmarks.create({
    parentId: parentId,
    title: folderName,
    type: "folder",
  });
}

/** Create a new bookmark toolbar */
function createBookmarkBar() {
  const getNewToolbarName = (index) => `${TOOLBAR_NAME_PREFIX} #${index}`;

  return getCurrentNbOfToolbars().then((index) => {
    return createFolder(getNewToolbarName(index + 1), TOOLBARS_SWITCHER_ID).then((newToolbar) => {
      bookmarkToolbarsFolders.push(newToolbar);
    });
  });
}

/** Returns the current number of existing bookmarks toolbars */
function getCurrentNbOfToolbars() {
  return browser.bookmarks.search(TOOLBAR_NAME_PREFIX).then((results) => {
    return results.length;
  });
}

// ==== BUTTON ACTION ==== //
function switchToolbar() {
  switchFolders(TOOLBAR_FOLDER_ID, bookmarkToolbarsFolders[0].id);
}

// ==== INIT ==== //

/**
 * Run at first launch
 * Create a new bookmark toolbar folder
 */
function initExtension() {
  return createFolder(TOOLBARS_SWITCHER_NAME).then((mainFolder) => {
    TOOLBARS_SWITCHER_ID = mainFolder.id;
    return createBookmarkBar();
  });
}

/** Load existing bookmark toolbars */
function loadExistingData() {
  return browser.bookmarks.search(TOOLBAR_NAME_PREFIX).then((results) => {
    bookmarkToolbarsFolders.push(...results);
  });
}

/** ENTRY POINT */
function startExtension() {
  browser.browserAction.onClicked.addListener(switchToolbar);

  return browser.bookmarks.search({ title: TOOLBARS_SWITCHER_NAME }).then((results) => {
    if (results.length === 0) {
      initExtension();
    }
    loadExistingData();
  });
}

startExtension();