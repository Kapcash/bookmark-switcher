<template>
  <h1>SETTINGS</h1>
</template>

<script>
import { searchBookmarkByTitle } from '../bookmarkHelper'

export default {
  name: 'Settings',
  async mounted () {
    console.log('SETTIGS')
    // GET bookmarkSwitcher folder
    // LIST bookmarks from that folder
    // Checkbox to pin them
    // Store it
    // Update switch algorithm
    const test = await searchBookmarkByTitle('_BookmarksSwitcher')
    console.log('booking', test)
  }
}
</script>

<style>
html {
  width: 400px;
  height: 400px;
}
</style>
