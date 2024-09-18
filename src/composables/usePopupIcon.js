import { watch } from 'vue'
import browser from 'webextension-polyfill'

export function updatePopupIcon (emojiRef) {
  updateActionIcon(emojiRef.value)
  watch(emojiRef, (newEmoji) => {
    updateActionIcon(newEmoji)
  })
}

function updateActionIcon (emoji) {
  const isDarkTheme = (typeof window !== 'undefined') ? window.matchMedia('(prefers-color-scheme: dark)').matches : false

  function getImageData (size = 64) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const baseImage = new Image()

    if (isDarkTheme) {
      baseImage.src = import(`../assets/icons/bookmark-switcher-logo-stroke-${size}.png`)
    } else {
      baseImage.src = import(`../assets/icons/bookmark-switcher-logo-plain-${size}.png`)
    }

    return new Promise((resolve) => {
      baseImage.onload = function () {
        if (emoji) {
          ctx.drawImage(baseImage, 0, 0)
          ctx.font = `${Math.floor(size * 0.85)}px sans-serif`
          ctx.fillText(emoji, Math.floor(size * 0.25), Math.floor(size))
        } else {
          ctx.drawImage(baseImage, 0, 0)
        }

        resolve(ctx.getImageData(0, 0, size, size))
      }
    })
  }

  Promise.all([
    getImageData(16),
    getImageData(32),
    getImageData(64),
  ]).then(([size16, size32, size64]) => {
    browser.browserAction.setIcon({
      imageData: {
        16: size16,
        32: size32,
        64: size64,
      },
    })
  })
}
