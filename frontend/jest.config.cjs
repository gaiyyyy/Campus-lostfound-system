module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['vue', 'js', 'json', 'jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/components/**/*.vue',
    'src/views/**/*.vue',
    '!src/**/*.spec.js',
    '!src/main.js',
    '!src/router/index.js',
    '!src/App.vue'
  ],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 50,
      lines: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/_tests_/setup.js'],
  testMatch: [
    '**/_tests_/**/*.test.js',
    '**/_tests_/**/*.spec.js'
  ]
}