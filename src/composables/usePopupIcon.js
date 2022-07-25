import { watch } from 'vue'

export function updatePopupIcon (emojiRef) {
  updateActionIcon(emojiRef.value)
  watch(emojiRef, (newEmoji) => {
    updateActionIcon(newEmoji)
  })
}

function updateActionIcon (emoji) {
  const canvas = document.createElement('canvas')

  const ctx = canvas.getContext('2d')
  const baseImage = new Image()

  const isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (isDarkTheme) {
    baseImage.src = require('../../assets/bookmark-switcher-logo-stroke.png')
  } else {
    baseImage.src = require('../../assets/bookmark-switcher-logo-plain.png')
  }

  baseImage.onload = function () {
    if (emoji) {
      ctx.drawImage(baseImage, -10, 0)
      ctx.font = '52px sans-serif'
      ctx.fillText(emoji, 12, 60)
    } else {
      ctx.drawImage(baseImage, 0, 0)
    }

    const imageData = ctx.getImageData(0, 0, 64, 64)

    browser.browserAction.setIcon({ imageData })
  }
}
