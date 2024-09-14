import { onMessage, sendMessage } from 'webext-bridge/background'
import { computed } from 'vue'
import { useBookmarkBars } from '@/composables/useBookmarks'
import { updatePopupIcon } from '@/composables/usePopupIcon'
import { NEXT_BAR_COMMAND_NAME } from '@/logic/constants'
import browser from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

let switchToNextBar = () => { console.warn('Running action before the state is loaded!') }
let switchToBar = () => { console.warn('Running action before the state is loaded!') }

useBookmarkBars().then(({ bars: bookmarkBars, currentBar, currentBarIndex }) => {
  // ==== BUTTON ACTION ==== //
  switchToNextBar = () => {
    const nextBarIndex = (currentBarIndex.value + 1) % bookmarkBars.value.length
    console.debug('NEXT BAR', bookmarkBars.value[nextBarIndex].title)
    currentBar.value = bookmarkBars.value[nextBarIndex] || null
  }

  switchToBar = (barId) => {
    const targetBar = bookmarkBars.value.find(bar => bar.id === barId)
    currentBar.value = targetBar || null
  }

  // updatePopupIcon(computed(() => currentBar.value?.icon))
})

browser.runtime.onMessage.addListener(({ currentBarId }) => {
  if (currentBarId) {
    switchToBar(currentBarId)
  }
})

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case NEXT_BAR_COMMAND_NAME:
      switchToNextBar()
      break
    default:
      break
  }
})

browser.runtime.onInstalled.addListener(() => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})
