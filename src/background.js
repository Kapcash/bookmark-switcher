/* eslint-disable no-unused-vars */

import {
  TOOLBAR_FOLDER_ID,
  getFolderChildrens,
  switchFolders
} from '@/bookmarkHelper'

import {
  getBookmarkSwitcherFolder,
  createBookmarkSwitcherFolder,
  createAnonymousCurrentBarFolder,
  getCurrentFolderId
} from '@/bookmarkState'

let MAIN_BOOKMARK_FOLDER, currentBookmarkFolderId
let bookmarkToolbarsFolders = []

// ==== BUTTON ACTION ==== //
function switchToolbar () {
  switchFolders(TOOLBAR_FOLDER_ID, bookmarkToolbarsFolders[0].id)
}

function listenerToStoreChanges () {
  browser.storage.onChanged.addListener(({ currentToolbar }) => {
    currentBookmarkFolderId = currentToolbar.newValue
  })
}

function registerCurrentState (mainFolder) {
  MAIN_BOOKMARK_FOLDER = mainFolder.id
  return getCurrentFolderId().then((currentFolderId) => {
    if (!currentFolderId) {
      return createAnonymousCurrentBarFolder()
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
