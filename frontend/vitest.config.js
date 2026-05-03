// vitest.config.js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/_tests_/setup.js'],
    include: ['src/_tests_/**/*.spec.js'],
    
    // Vitest 4 配置
    maxWorkers: 1,
    isolate: false,
    testTimeout: 10000,
    
    // 关键：mock 样式文件和路由
    server: {
      deps: {
        inline: ['element-plus']
      }
    },
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/api/**/*.js', 'src/components/**/*.vue'],
      thresholds: {
        statements: 50,
        functions: 50,
        lines: 50
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})