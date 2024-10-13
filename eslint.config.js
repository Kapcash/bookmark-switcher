import antfu from '@antfu/eslint-config'

export default antfu({
  parserOptions: {
    sourceType: 'module',
  },
  languageOptions: {
    globals: {
      process: true,
    },
  },
  rules: {
    'no-console': 'off',
  },
})
