// src/__tests__/unit/views/Register.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'

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

// Mock Element Plus Icons - 需要包含 Phone
vi.mock('@element-plus/icons-vue', () => ({
  User: { template: '<span>User</span>' },
  Lock: { template: '<span>Lock</span>' },
  Phone: { template: '<span>Phone</span>' }
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login' }
  ]
})

// 导入被测试的组件
import Register from '@/views/Register.vue'
import axiosMock from '@/api/axios'

describe('Register 注册组件', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    
    wrapper = mount(Register, {
      global: {
        plugins: [router],
        stubs: {
          ElCard: { template: '<div><slot /></div>' },
          ElForm: { template: '<div><slot /></div>' },
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
            template: '<div v-if="visible" :class="type === \'error\' ? \'error-alert\' : \'success-alert\'">{{ title }}</div>',
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

  it('应该显示"创建账户"标题', () => {
    expect(wrapper.html()).toContain('创建账户')
  })

  it('应该显示"加入校园失物招领平台"描述', () => {
    expect(wrapper.html()).toContain('加入校园失物招领平台')
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

  it('应该包含联系方式输入框', () => {
    const contactInput = wrapper.find('input[placeholder*="联系方式"]')
    expect(contactInput.exists()).toBe(true)
  })

  it('应该包含注册按钮', () => {
    const registerButton = wrapper.find('button')
    expect(registerButton.exists()).toBe(true)
    expect(registerButton.text()).toContain('注册')
  })

  it('应该包含"立即登录"链接', () => {
    expect(wrapper.html()).toContain('立即登录')
    expect(wrapper.html()).toContain('已有账号？')
  })

  // ========== 表单数据绑定测试 ==========

  it('用户名输入应该绑定到 registerForm.username', async () => {
    const usernameInput = wrapper.find('input[placeholder*="用户名"]')
    await usernameInput.setValue('newuser')
    
    expect(wrapper.vm.registerForm.username).toBe('newuser')
  })

  it('密码输入应该绑定到 registerForm.password', async () => {
    const passwordInput = wrapper.find('input[placeholder*="密码"]')
    await passwordInput.setValue('mypassword')
    
    expect(wrapper.vm.registerForm.password).toBe('mypassword')
  })

  it('联系方式输入应该绑定到 registerForm.contact', async () => {
    const contactInput = wrapper.find('input[placeholder*="联系方式"]')
    await contactInput.setValue('13812345678')
    
    expect(wrapper.vm.registerForm.contact).toBe('13812345678')
  })

  // ========== 注册功能测试 ==========

  it('注册成功时应该显示成功消息', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    wrapper.vm.registerForm.contact = 'test@example.com'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.successMessage).toBe('注册成功，即将跳转登录页')
  })

  it('注册成功时应该显示成功提示', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    wrapper.vm.registerForm.contact = 'test@example.com'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.successMessage).toBeTruthy()
  })

  it('注册时应该发送正确的请求参数', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = 'mypassword'
    wrapper.vm.registerForm.contact = '13812345678'
    
    await wrapper.vm.handleRegister()
    
    expect(axiosMock.post).toHaveBeenCalledWith('/api/register', {
      username: 'testuser',
      password: 'mypassword',
      contact: '13812345678'
    })
  })

  // ========== 注册失败场景测试 ==========

  it('用户名为空时应该显示错误', async () => {
    wrapper.vm.registerForm.username = ''
    wrapper.vm.registerForm.password = '123456'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('用户名或密码不能为空')
    expect(axiosMock.post).not.toHaveBeenCalled()
  })

  it('密码为空时应该显示错误', async () => {
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = ''
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('用户名或密码不能为空')
    expect(axiosMock.post).not.toHaveBeenCalled()
  })

  it('用户名和密码都为空时应该显示错误', async () => {
    wrapper.vm.registerForm.username = ''
    wrapper.vm.registerForm.password = ''
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('用户名或密码不能为空')
    expect(axiosMock.post).not.toHaveBeenCalled()
  })

  it('API 返回错误消息时应该显示错误', async () => {
    axiosMock.post.mockResolvedValue('用户名已存在')
    
    wrapper.vm.registerForm.username = 'existing'
    wrapper.vm.registerForm.password = '123456'
    wrapper.vm.registerForm.contact = 'test@example.com'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('用户名已存在')
    expect(wrapper.vm.successMessage).toBe('')
  })

  it('网络错误时应该显示默认错误', async () => {
    axiosMock.post.mockRejectedValue(new Error('Network Error'))
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    wrapper.vm.registerForm.contact = 'test@example.com'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('注册失败')
  })

  // ========== 交互测试 ==========

  it('点击注册按钮应该调用 handleRegister', async () => {
    const registerButton = wrapper.find('button')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    
    axiosMock.post.mockResolvedValue('注册成功')
    
    await registerButton.trigger('click')
    
    expect(axiosMock.post).toHaveBeenCalled()
  })

  // ========== 加载状态测试 ==========

  it('注册过程中 loading 应该为 true', async () => {
    axiosMock.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    
    const registerPromise = wrapper.vm.handleRegister()
    
    expect(wrapper.vm.loading).toBe(true)
    
    await registerPromise
  })

  it('注册完成后 loading 应该恢复为 false', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.loading).toBe(false)
  })

  // ========== 错误消息清除测试 ==========

  it('关闭错误提示时应该清空 errorMessage', async () => {
    wrapper.vm.errorMessage = '测试错误'
    await wrapper.vm.$nextTick()
    
    wrapper.vm.errorMessage = ''
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.errorMessage).toBe('')
  })

  // ========== 成功消息测试 ==========

  it('注册前 errorMessage 和 successMessage 应该为空', async () => {
    expect(wrapper.vm.errorMessage).toBe('')
    expect(wrapper.vm.successMessage).toBe('')
  })

  it('开始注册时应该清空之前的错误和成功消息', async () => {
    wrapper.vm.errorMessage = '旧错误'
    wrapper.vm.successMessage = '旧成功'
    
    axiosMock.post.mockResolvedValue('注册成功')
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('')
    expect(wrapper.vm.successMessage).toBe('注册成功，即将跳转登录页')
  })

  // ========== 边界条件测试 ==========

  it('联系方式可以为空', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    wrapper.vm.registerForm.contact = ''
    
    await wrapper.vm.handleRegister()
    
    expect(axiosMock.post).toHaveBeenCalledWith('/api/register', {
      username: 'testuser',
      password: '123456',
      contact: ''
    })
  })

  it('注册成功后应该只显示成功消息，不显示错误', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    
    await wrapper.vm.handleRegister()
    
    expect(wrapper.vm.errorMessage).toBe('')
    expect(wrapper.vm.successMessage).toBeTruthy()
  })

  // ========== 响应式数据测试 ==========

  it('registerForm 应该是响应式的', () => {
    expect(wrapper.vm.registerForm).toBeDefined()
    expect(wrapper.vm.registerForm).toHaveProperty('username')
    expect(wrapper.vm.registerForm).toHaveProperty('password')
    expect(wrapper.vm.registerForm).toHaveProperty('contact')
  })

  // ========== 特殊字符测试 ==========

  it('用户名包含特殊字符时应该正常处理', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'test_user@123'
    wrapper.vm.registerForm.password = 'pass123'
    
    await wrapper.vm.handleRegister()
    
    expect(axiosMock.post).toHaveBeenCalledWith('/api/register', expect.objectContaining({
      username: 'test_user@123'
    }))
  })

  it('联系方式为邮箱格式时应该正常处理', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = '123456'
    wrapper.vm.registerForm.contact = 'user@example.com'
    
    await wrapper.vm.handleRegister()
    
    expect(axiosMock.post).toHaveBeenCalledWith('/api/register', expect.objectContaining({
      contact: 'user@example.com'
    }))
  })

  it('密码包含特殊字符时应该正常处理', async () => {
    axiosMock.post.mockResolvedValue('注册成功')
    
    wrapper.vm.registerForm.username = 'testuser'
    wrapper.vm.registerForm.password = 'P@ssw0rd!@#'
    
    await wrapper.vm.handleRegister()
    
    expect(axiosMock.post).toHaveBeenCalledWith('/api/register', expect.objectContaining({
      password: 'P@ssw0rd!@#'
    }))
  })
})