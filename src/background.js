/* eslint-disable no-unused-vars */

import {
  TOOLBAR_FOLDER_ID,
  getFolderChildrens,
  getCurrentFolderId,
  switchFolders,
  setCurrentFolderId,
  createBookmarkFolder
} from '@/bookmarkHelper'

import {
  getBookmarkSwitcherFolder,
  createBookmarkSwitcherFolder
} from '@/bookmarkState'

let MAIN_BOOKMARK_FOLDER, currentBookmarkFolderId
let bookmarkToolbarsFolders = []

// ==== BUTTON ACTION ==== //
function switchToolbar () {
  switchFolders(TOOLBAR_FOLDER_ID, bookmarkToolbarsFolders[0].id)
}

async function createDefaultFolderForCurrentBookmarkBar () {
  const { id } = await createBookmarkFolder('Current bookmark bar', MAIN_BOOKMARK_FOLDER)
  setCurrentFolderId(id)
}

function listenerToStoreChanges () {
  browser.storage.onChanged.addListener(({ currentToolbar }) => {
    currentBookmarkFolderId = currentToolbar.newValue
  })
}

function registerCurrentState (mainFolder) {
  MAIN_BOOKMARK_FOLDER = mainFolder.id
  return getCurrentFolderId().then((currentFolderId) => {
    if (currentFolderId) {
      return setCurrentFolderId(currentFolderId)
    } else {
      return createDefaultFolderForCurrentBookmarkBar()
    }
  })
}

/** Load existing bookmark toolbars */
function loadExistingBars () {
  return getFolderChildrens(MAIN_BOOKMARK_FOLDER).then((toolbars) => {
    bookmarkToolbarsFolders = toolbars
  })
}

/** ENTRY POINT */
async function startExtension () {
  listenerToStoreChanges()
  const mainFolder = await getBookmarkSwitcherFolder()

  if (!mainFolder) {
    await createBookmarkSwitcherFolder()
  }
  await registerCurrentState(mainFolder)
  return loadExistingBars()
}

startExtension()
