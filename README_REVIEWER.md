Hello dear reviewer!

Here are the information you need to review my addon.

Requirements:
- Nodejs: v15.3.0
- Npm: 7.0.14 or *Yarn: v.1.22.10*
- OS: MacOS Big Sure v11.2.3

To know:
- The addon is build with Vuejs framework (and the vue-cli for scaffolding)
- It's fully open source (see link in package.json)
- The unsafe `eval` warnings comes from Vue source. No user or external input are used in such functions.

Steps to build and debug:
- Run `yarn install` or `npm install` to install dependencies
- Run `yarn serve` or `npm run serve` to build the production output in the /dist folder
  - Open `/dist/manifest.json` from `addon:debugging` in Firefox to debug the app if needed.
- `yarn build` or `npm run build` creates both the `/dist` folder and the addon `.zip` file under `/artifacts`