import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@element-plus/icons-vue', () => ({
  ArrowDown: { template: '<span>ArrowDown</span>' },
  UserFilled: { template: '<span>UserFilled</span>' },
  User: { template: '<span>User</span>' },
  Setting: { template: '<span>Setting</span>' },
  SwitchButton: { template: '<span>SwitchButton</span>' },
  Bell: { template: '<span>Bell</span>' },
  Box: { template: '<span>Box</span>' },
  Search: { template: '<span>Search</span>' },
  View: { template: '<span>View</span>' }
}))

const mockRouter = {
  push: vi.fn()
}

const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => mockRouter
  }
})

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

import Home from '@/views/Home.vue'

describe('Home 首页', () => {
  let wrapper

  beforeEach(async () => {
    vi.clearAllMocks()
    mockLocalStorage.clear()

    mockLocalStorage.getItem.mockImplementation(key => {
      const data = {
        username: 'alice',
        role: 'admin'
      }
      return data[key] || null
    })

    wrapper = mount(Home, {
      global: {
        stubs: {
          ElHeader: { template: '<header><slot /></header>' },
          ElCard: { template: '<div><slot /></div>' },
          ElDropdown: { template: '<div><slot /><slot name="dropdown" /></div>' },
          ElDropdownMenu: { template: '<div><slot /></div>' },
          ElDropdownItem: { template: '<div><slot /></div>' },
          ElButton: {
            template: '<button @click="$attrs.onClick"><slot /></button>',
            props: ['type', 'size']
          },
          ElIcon: { template: '<span><slot /></span>' }
        }
      }
    })

    await wrapper.vm.$nextTick()
  })

  it('应该显示当前用户名和管理员身份', () => {
    expect(wrapper.text()).toContain('alice')
    expect(wrapper.text()).toContain('管理员')
  })

  it('查看失物和招领按钮应该跳转到对应页面', () => {
    wrapper.vm.goLostList()
    expect(mockRouter.push).toHaveBeenCalledWith('/lost_item/list')

    wrapper.vm.goFoundList()
    expect(mockRouter.push).toHaveBeenCalledWith('/found')
  })

  it('个人中心和管理入口应该跳转正确路由', () => {
    wrapper.vm.goProfile()
    expect(mockRouter.push).toHaveBeenCalledWith('/profile')

    wrapper.vm.goAdmin()
    expect(mockRouter.push).toHaveBeenCalledWith('/admin')
  })

  it('退出登录应该清空存储并跳转登录页', () => {
    wrapper.vm.logout()

    expect(mockLocalStorage.clear).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })
})