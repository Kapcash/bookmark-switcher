/* TODO
 * Create new toolbar folder under _BookmarkSwitcher for current toolbar (1 folder copy for each bar)
 * Fix switching: dont switch between current and chosen folder, move current to their folder, then move select to bookmark bar
 * Styling popup
 */

function createNewBar() {
  const newBarName = document.getElementById('newBarNameInput').value;
  createBookmarkBar(newBarName)
}

function addItemToList(name, id, disabled) {
  const listElm = document.getElementById('bookmarkBars')
  const newListItem = document.createElement('li')
  const newSwitchButton = document.createElement('button')
  newSwitchButton.disabled = disabled
  newSwitchButton.textContent = name
  newSwitchButton.addEventListener('click', () => switchToolbar(id))
  newListItem.appendChild(newSwitchButton)
  listElm.appendChild(newListItem)
}

const ROOT_FOLDER_ID = 'root_____';
const MENU_FOLDER_ID = 'menu________';
const TOOLBAR_FOLDER_ID = 'toolbar_____';
const TOOLBARS_SWITCHER_NAME = '_BookmarksSwitcher';
let TOOLBARS_SWITCHER_ID;

/** Get all bookmarks of a folder */
function getFolderChildrens(folderId) {
  return browser.bookmarks.getChildren(folderId);
}

/**
 * Create a new bookmark folder
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

function moveToFolder(targetFolderId) {
  return (bookmark) => browser.bookmarks.move(bookmark.id, { parentId: targetFolderId });
}

/** Switch bookmarks between two folders */
async function switchFolders(srcFolderId, targetFolderId) {
  const [srcBookmarks, targetBookmarks] = await Promise.all([getFolderChildrens(srcFolderId), getFolderChildrens(targetFolderId)]);
  // We have to await all to avoid concurrency move in a same folder -> indexes are messed up with such concurrency!
  await Promise.all(targetBookmarks.map(moveToFolder(srcFolderId))); // Move to src folder before to avoid having a complete empty folder at a moment
  await Promise.all(srcBookmarks.map(moveToFolder(targetFolderId)));
}

/**
 * Create a new bookmark toolbar
 * @param name Optional toolbar name
 */
async function createBookmarkBar(name = 'Anonym Toolbar') {
  return createFolder(name, TOOLBARS_SWITCHER_ID).then((newToolbar) => {
    addItemToList(newToolbar.title, newToolbar.id)
  });
}

/** Get the list of additional existing toolbars (excluding the main one) */
function getExistingToolbars() {
  return getFolderChildrens(TOOLBARS_SWITCHER_ID);
}

/** Get the extension main bookmark folder (where we store hidden toolbars) */
function getBookmarkSwitcherFolder() {
  return browser.bookmarks.search({ title: TOOLBARS_SWITCHER_NAME });
}

// ==== BUTTON ACTION ==== //
function switchToolbar(id) {
  switchFolders(TOOLBAR_FOLDER_ID, id);
}

// ==== INIT ==== //

/** Load existing bookmark toolbars */
function loadExistingData() {
  addItemToList('Current bookmark bar', undefined, true)
  return getExistingToolbars().then((toolbars) => {
    toolbars.forEach((bar) => {
      addItemToList(bar.title, bar.id)
    })
  });
}

/** ENTRY POINT */
async function initPopup() {
  const newBtn = document.getElementById('addNewBarBtn')
  newBtn.disabled = true
  
  const results = await getBookmarkSwitcherFolder();
  if (results[0]) {
    // Register toolbar switcher id
    TOOLBARS_SWITCHER_ID = results[0].id;
  } else {
    throw Exception("Can't find extension's bookmark folder. Please restart the extension.")
  }
  await loadExistingData();

  newBtn.addEventListener('click', createNewBar)
  newBtn.disabled = false
}

initPopup()