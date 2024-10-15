Hello dear reviewer!

Here are the information you need to review my addon.

Requirements:
- Nodejs: v15.3.0
- Npm: 7.0.14 or *Pnpm*

Source code is hosted on Github

```bash
git clone git@github.com:Kapcash/bookmark-switcher.git
```

To know:
- The addon is build with Vuejs framework
- It's fully open source (see link in package.json)
- The unsafe `eval` warnings comes from Vue source. No user or external input are used in such functions.

Steps to build and debug:
- Run `pnpm install` to install dependencies
- Run `ADDON_ID=1234 pnpm build:firefox` to build the project for Firefox in the /extensions folder.
  - Open `/extensions/manifest.json` from `addon:debugging` in Firefox to debug the app if needed.
