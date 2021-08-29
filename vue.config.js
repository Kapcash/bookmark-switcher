module.exports = {
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'Popup'
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.js'
        }
      },
      artifactFilename: ({ name, version }) => {
        const browser = process.env.VUE_APP_IS_CHROME === 'true' ? 'chrome' : 'firefox'
        return `${name}-v${version}-${browser}.zip`
      },
      manifestTransformer: (manifest) => {
        const addonId = process.env.ADDON_ID
        manifest.browser_specific_settings.gecko.id = `{${addonId}}`
        return manifest
      }
    }
  }
}
