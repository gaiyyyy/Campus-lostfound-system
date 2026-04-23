// src/__tests__/unit/views/Login.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'

// Mock axios
vi.mock('@/api/axios', () => ({
  default: {
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock alert
global.alert = vi.fn()

// 创建 mock router 对象
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn()
}

describe('Login 登录组件', () => {
  let wrapper

  beforeEach(async () => {
    vi.clearAllMocks()
    mockLocalStorage.clear()
    mockRouter.push.mockClear()
    
    const axiosMock = await import('@/api/axios')
    axiosMock.default.post.mockReset()
    
    wrapper = mount(Login, {
      global: {
        mocks: {
          $router: mockRouter,
          $route: { path: '/login' }
        },
        stubs: {
          ElCard: { template: '<div><slot /></div>' },
          ElForm: {
            template: '<div><slot /></div>',
            methods: {
              validate: (callback) => callback(true)
            }
          },
          ElFormItem: { template: '<div><slot /></div>' },
          ElInput: {
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :type="type" :placeholder="placeholder" />',
            props: ['modelValue', 'type', 'placeholder', 'prefixIcon']
          },
          ElButton: {
            template: '<button @click="$attrs.onClick" :loading="$attrs.loading"><slot /></button>',
            props: ['loading', 'type']
          },
          ElAlert: {
            template: '<div v-if="visible">{{ title }}</div>',
            props: ['title', 'type', 'showIcon', 'closable'],
            data: () => ({ visible: true })
          },
          ElIcon: { template: '<span><slot /></span>' }
        }
      }
    })
  })

  // ========== 渲染测试 ==========

  it('组件应该正确渲染', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('应该显示"欢迎回来"标题', () => {
    expect(wrapper.html()).toContain('欢迎回来')
  })

  it('应该显示"请登录您的账户"描述', () => {
    expect(wrapper.html()).toContain('请登录您的账户')
  })

  it('应该包含用户名输入框', () => {
    const usernameInput = wrapper.find('input[placeholder*="用户名"]')
    expect(usernameInput.exists()).toBe(true)
  })

  it('应该包含密码输入框', () => {
    const passwordInput = wrapper.find('input[placeholder*="密码"]')
    expect(passwordInput.exists()).toBe(true)
  })

  it('密码输入框类型应该是 password', () => {
    const passwordInput = wrapper.find('input[placeholder*="密码"]')
    expect(passwordInput.attributes('type')).toBe('password')
  })

  it('应该包含登录按钮', () => {
    const loginButton = wrapper.find('button')
    expect(loginButton.exists()).toBe(true)
    expect(loginButton.text()).toContain('登录')
  })

  it('应该包含"立即注册"链接', () => {
    expect(wrapper.html()).toContain('立即注册')
    expect(wrapper.html()).toContain('没有账号？')
  })

  // ========== 表单验证测试 ==========

  it('用户名为空时应该显示验证错误', async () => {
    const usernameInput = wrapper.find('input[placeholder*="用户名"]')
    await usernameInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    const rules = wrapper.vm.loginRules
    expect(rules.username[0].required).toBe(true)
    expect(rules.username[0].message).toBe('请输入用户名')
  })

  it('密码为空时应该显示验证错误', async () => {
    const passwordInput = wrapper.find('input[placeholder*="密码"]')
    await passwordInput.trigger('blur')
    await wrapper.vm.$nextTick()
    
    const rules = wrapper.vm.loginRules
    expect(rules.password[0].required).toBe(true)
    expect(rules.password[0].message).toBe('请输入密码')
  })

  it('表单验证规则应该正确配置', () => {
    const rules = wrapper.vm.loginRules
    expect(rules).toHaveProperty('username')
    expect(rules).toHaveProperty('password')
  })

  // ========== 登录功能测试 ==========

  it('登录成功时应该保存 token 到 localStorage', async () => {
    const axiosMock = await import('@/api/axios')
    const mockResponse = {
      token: 'fake-jwt-token-123',
      username: 'testuser',
      role: 'user',
      id: 1
    }
    axiosMock.default.post.mockResolvedValue(mockResponse)
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = '123456'
    
    // Mock 表单验证通过
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', 'fake-jwt-token-123')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('username', 'testuser')
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('role', 'user')
  })

  it('登录成功时应该保存角色信息', async () => {
    const axiosMock = await import('@/api/axios')
    const mockResponse = {
      token: 'fake-token',
      username: 'admin',
      role: 'admin',
      id: 1
    }
    axiosMock.default.post.mockResolvedValue(mockResponse)
    
    wrapper.vm.loginForm.username = 'admin'
    wrapper.vm.loginForm.password = 'admin123'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('role', 'admin')
  })

  it('登录成功时应该弹出欢迎提示', async () => {
    const axiosMock = await import('@/api/axios')
    const mockResponse = {
      token: 'fake-token',
      username: 'testuser',
      role: 'user'
    }
    axiosMock.default.post.mockResolvedValue(mockResponse)
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = '123456'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(global.alert).toHaveBeenCalledWith('登录成功，欢迎 testuser (用户)')
  })

  // ========== 登录失败场景测试 ==========

  it('登录失败时应该显示错误消息', async () => {
    const axiosMock = await import('@/api/axios')
    const errorResponse = {
      message: '用户名或密码错误'
    }
    axiosMock.default.post.mockResolvedValue(errorResponse)
    
    wrapper.vm.loginForm.username = 'wronguser'
    wrapper.vm.loginForm.password = 'wrongpass'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(wrapper.vm.errorMessage).toBe('用户名或密码错误')
  })

  it('响应中没有 token 时应该显示错误', async () => {
    const axiosMock = await import('@/api/axios')
    const mockResponse = {
      username: 'testuser',
      role: 'user'
    }
    axiosMock.default.post.mockResolvedValue(mockResponse)
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = '123456'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(wrapper.vm.errorMessage).toBe('登录失败：未获取到认证令牌')
  })

  it('网络错误时应该显示错误消息', async () => {
    const axiosMock = await import('@/api/axios')
    const error = {
      response: {
        data: {
          message: '服务器连接失败'
        }
      }
    }
    axiosMock.default.post.mockRejectedValue(error)
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = '123456'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(wrapper.vm.errorMessage).toBe('服务器连接失败')
  })

  it('网络错误没有响应消息时应该显示默认错误', async () => {
    const axiosMock = await import('@/api/axios')
    axiosMock.default.post.mockRejectedValue(new Error('Network Error'))
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = '123456'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(wrapper.vm.errorMessage).toBe('登录失败')
  })

  // ========== 登录请求参数测试 ==========

  it('登录时应该发送正确的请求参数', async () => {
    const axiosMock = await import('@/api/axios')
    const mockResponse = { token: 'fake-token', username: 'testuser', role: 'user' }
    axiosMock.default.post.mockResolvedValue(mockResponse)
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = 'mypassword123'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(axiosMock.default.post).toHaveBeenCalledWith('/api/login', {
      username: 'testuser',
      password: 'mypassword123'
    })
  })

  // ========== 响应式数据测试 ==========

  it('loginForm 应该是响应式的', () => {
    expect(wrapper.vm.loginForm).toBeDefined()
    expect(wrapper.vm.loginForm).toHaveProperty('username')
    expect(wrapper.vm.loginForm).toHaveProperty('password')
  })

  it('用户名输入应该绑定到 loginForm.username', async () => {
    const usernameInput = wrapper.find('input[placeholder*="用户名"]')
    await usernameInput.setValue('newusername')
    
    expect(wrapper.vm.loginForm.username).toBe('newusername')
  })

  it('密码输入应该绑定到 loginForm.password', async () => {
    const passwordInput = wrapper.find('input[placeholder*="密码"]')
    await passwordInput.setValue('newpassword')
    
    expect(wrapper.vm.loginForm.password).toBe('newpassword')
  })

  // ========== 角色默认值测试 ==========

  it('登录响应中没有 role 时应该默认设置为 user', async () => {
    const axiosMock = await import('@/api/axios')
    const mockResponse = {
      token: 'fake-token',
      username: 'testuser',
      id: 1
    }
    axiosMock.default.post.mockResolvedValue(mockResponse)
    
    wrapper.vm.loginForm.username = 'testuser'
    wrapper.vm.loginForm.password = '123456'
    
    wrapper.vm.loginFormRef = {
      validate: (cb) => cb(true)
    }
    
    await wrapper.vm.handleLogin()
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('role', 'user')
  })
})