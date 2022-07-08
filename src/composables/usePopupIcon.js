import { watch } from 'vue'

export function updatePopupIcon (emojiRef) {
  watch(emojiRef, (newEmoji) => {
    updateActionIcon(newEmoji)
  })

  function updateActionIcon (emoji) {
    const canvas = document.createElement('canvas')

    const ctx = canvas.getContext('2d')
    const baseImage = new Image()
    baseImage.src = require('../../assets/bookmark-switcher-logo.png')
    baseImage.onload = function () {
      if (emoji) {
        ctx.drawImage(baseImage, -10, 0)
        ctx.font = '52px sans-serif'
        // ctx.textBaseline = 'bottom'
        ctx.fillText(emoji, 12, 60)
      } else {
        ctx.drawImage(baseImage, 0, 0)
      }

      const imageData = ctx.getImageData(0, 0, 64, 64)

      browser.browserAction.setIcon({ imageData })
    }
  }
}
