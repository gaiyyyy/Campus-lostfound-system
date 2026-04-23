// src/__tests__/setup.js
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 注意：不要在这里重新定义 localStorage 和 sessionStorage
// 因为测试文件中已经有 mock 了，冲突会导致 "Cannot assign to read only property" 错误

// Mock vue-router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn()
  }),
  useRoute: () => ({
    path: '/',
    params: {},
    query: {}
  }),
  createRouter: vi.fn(),
  createWebHistory: vi.fn()
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue('confirm'),
    alert: vi.fn().mockResolvedValue('confirm')
  }
}))

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Box: { template: '<span>Box</span>' },
  HomeFilled: { template: '<span>HomeFilled</span>' },
  Plus: { template: '<span>Plus</span>' },
  Search: { template: '<span>Search</span>' },
  Delete: { template: '<span>Delete</span>' },
  List: { template: '<span>List</span>' },
  Location: { template: '<span>Location</span>' },
  View: { template: '<span>View</span>' },
  User: { template: '<span>User</span>' },
  Lock: { template: '<span>Lock</span>' },
  Present: { template: '<span>Present</span>' }
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Vue Test Utils 配置
config.global.stubs = {
  ElButton: true,
  ElInput: true,
  ElSelect: true,
  ElOption: true,
  ElDialog: true,
  ElForm: true,
  ElFormItem: true,
  ElCard: true,
  ElTable: true,
  ElTableColumn: true,
  ElUpload: true,
  ElImage: true,
  ElTag: true,
  ElPagination: true,
  ElLoading: true,
  ElHeader: true,
  ElAvatar: true,
  ElTooltip: true,
  ElIcon: true,
  ElAlert: true,
  RouterLink: true,
  RouterView: true
}