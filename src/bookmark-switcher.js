// (function() {
  const ROOT_FOLDER_ID = 'root_____';
  const MENU_FOLDER_ID = 'menu________';
  const TOOLBAR_FOLDER_ID = 'toolbar_____';
  const TOOLBARS_SWITCHER_NAME = '_BookmarksSwitcher';
  let TOOLBARS_SWITCHER_ID, currentBookmarkFolderId;
  let bookmarkToolbarsFolders = [];
  
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
      bookmarkToolbarsFolders.push(newToolbar);
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
  function switchToolbar() {
    switchFolders(TOOLBAR_FOLDER_ID, bookmarkToolbarsFolders[0].id);
  }
  
  // ==== INIT ==== //
  
  /**
   * Run at first launch
   * Create a new bookmark toolbar folder
   */
  function initExtension() {
    return createFolder(TOOLBARS_SWITCHER_NAME).then(async (mainFolder) => {
      TOOLBARS_SWITCHER_ID = mainFolder.id;
      const { currentToolbar } = await browser.storage.local.get('currentToolbar');
      if (!currentToolbar) {
        createDefaultFolderForCurrentBookmarkBar();
      }
    });
  }

  async function createDefaultFolderForCurrentBookmarkBar() {
    const currentFolder = await createFolder('Current_toolbar', TOOLBARS_SWITCHER_ID);
    browser.storage.local.set({
      currentToolbar: currentFolder.id,
    });
  }

  function updateCurrentFolder({ changes }) {
    currentBookmarkFolderId = changes.currentToolbar
  }
  
  /** Load existing bookmark toolbars */
  function loadExistingData() {
    return getExistingToolbars().then((toolbars) => {
      bookmarkToolbarsFolders = toolbars;
    });
  }
  
  /** ENTRY POINT */
  async function startExtension() {
    browser.storage.onChanged.addListener(updateCurrentFolder);
    const results = await getBookmarkSwitcherFolder();

    if (results.length === 0) {
      // Can't find the extension main folder -> let's initialize it!
      await initExtension();
    } else {
      // Already exists? Then we can register its id
      TOOLBARS_SWITCHER_ID = results[0].id;
      browser.storage.local.get('currentToolbar').then((res) => {
        const folderId = res.currentToolbar;
        if (folderId) {
          currentBookmarkFolderId = folderId
        } else {
          createDefaultFolderForCurrentBookmarkBar();
        }
      });
    }
    loadExistingData();
  }
  
  startExtension();
// })();