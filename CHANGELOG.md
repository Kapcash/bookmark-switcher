## 3.0.0

- Fixed emojis list for older Operative Systems (only show up to Unicode V13 emojis).
- Improved options page texts.
- Add options page for Chrome (but the browser doesn't allow to dynamically change the extension shortcut, so this feature is disabled for Chrome).
- [Technical]
  - Upgrade to Manifest V3
  - Upgrade to use "Vitesse" framework
  - Full cross browser support (use polyfills)

## 2.1.0

- Add the preferences page for the extension
  - Possibility to update the extension shortcut directly from here
  - Can disable the synchronisation of the currently used profile between devices (enabled by default)

## 2.0.5

- Allow to switch to new bar just after creating it without needing to close the browser

## 2.0.4

- Do not stop switching process when closing popup

## 2.0.3

- Incorrect state when using hotkey action (switch profile) while the popup is opened
- Remove empty addon options page
- Display separators correctly on bookmarks list

## 2.0.2

- Fix popup icon size on non-retina screens
- Use correct popup icon on browser startup
- Edit name input: press enter keeps the change

## 2.0.1

- Fix `storage.sync.onChanged` exception on Waterfox. Used correct `storage.onChanged` method instead.

## 2.0.0

- Possibility to pin bookmarks. Pinned bookmarks will always stay on the bookmark bar even after moving to a different bar.
- Bars can now have a specific icon as an emoji. The icon will be shown on the popup button to hint the user which bar he is currently using.
- Added spanish 🇪🇸 translations

## 1.2.0

- Chrome compatibility!
- Moved internal addon bookmark folder to "Other bookmarks" instead of "Bookmarks Menu"
- Fixed popup flickering when creating a new bookmark bar

## 1.1.2

- Fixed Github issue #1: force move bookmarks sequentially.

## 1.1.1

- Version skipped

## 1.1.0

- Github issue #1: keep bookmark orders when switching. Improved throttling of switching function.
- Sync current addon state across multiple browsers (from different devices)
- Auto focus the text input when editing a bookmark bar name
- Minor style fixes
  
## 1.0.0

- Multiple bars support! 🎉
- New popup interface to select the current bookmark bar
- Possibility to rename, remove and create bookmark bars
- Alt+Space keyboard shortcut now switch to next existing bar
- Anti spam system to avoid multiple bar switch at the same time
- Support French language

## 0.0.3

- Added keyboard shortcut (Alt+Space) to trigger the switch
- Keep bookmark orders after switching

## 0.0.2

**First public version !**

- Clicking on the addon icon switch with a second bookmark toolbar.