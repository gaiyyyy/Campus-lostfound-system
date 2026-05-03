module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  globals: {
    ElMessage: 'readonly',
    ElMessageBox: 'readonly'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    // Relax rules that would generate many warnings in this codebase
    'vue/multi-word-component-names': 'off',
    'no-unused-vars': 'off',
    'vue/require-default-prop': 'off'
  }
}
