import antfu from '@antfu/eslint-config'

export default antfu({
  vue: {
    overrides: {
      "vue/max-attributes-per-line": ["error", {
        "singleline": {
          "max": 5,
        },
        "multiline": {
          "max": 1,
        },
      }],
    },
  },
})
