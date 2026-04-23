import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockRoute = {
  path: '/profile',
  params: {},
  query: {}
}

const mockProfileApi = vi.hoisted(() => ({
  getMyLostItems: vi.fn(),
  deleteLostItem: vi.fn(),
  getMyFoundItems: vi.fn(),
  deleteFoundItem: vi.fn(),
  updateUsername: vi.fn(),
  updatePassword: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

vi.mock('@/api/lostItem', () => ({
  getMyLostItems: mockProfileApi.getMyLostItems,
  deleteLostItem: mockProfileApi.deleteLostItem
}))

vi.mock('@/api/found', () => ({
  getMyFoundItems: mockProfileApi.getMyFoundItems,
  deleteFoundItem: mockProfileApi.deleteFoundItem
}))

vi.mock('@/api/user', () => ({
  updateUsername: mockProfileApi.updateUsername,
  updatePassword: mockProfileApi.updatePassword
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  },
  ElMessageBox: {
    confirm: vi.fn().mockResolvedValue('confirm')
  }
}))

vi.mock('@element-plus/icons-vue', () => ({
  ArrowDown: { template: '<span>ArrowDown</span>' },
  Plus: { template: '<span>Plus</span>' }
}))

import Profile from '@/views/Profile.vue'

describe('Profile 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.path = '/profile'
    mockProfileApi.getMyLostItems.mockResolvedValue([
      { id: 1, title: '丢失的书包', isOwner: true, category: '个人物品' }
    ])
    mockProfileApi.getMyFoundItems.mockResolvedValue([
      { id: 2, title: '捡到的校园卡', userId: 7, isOwner: true, category: '证件' }
    ])
    mockProfileApi.updateUsername.mockResolvedValue({ message: '修改成功' })
    mockProfileApi.updatePassword.mockResolvedValue({ message: '修改成功' })
    localStorage.setItem('username', 'alice')
    localStorage.setItem('userId', '7')
  })

  const mountPage = () => mount(Profile, {
    global: {
      stubs: {
        ElContainer: true,
        ElHeader: true,
        ElAside: true,
        ElMain: true,
        ElDropdown: true,
        ElDropdownMenu: true,
        ElDropdownItem: true,
        ElButton: true,
        ElDialog: true,
        ElForm: true,
        ElFormItem: true,
        ElInput: true,
        ElMenu: true,
        ElMenuItem: true,
        ElTag: true,
        ElTable: true,
        ElTableColumn: true,
        ElEmpty: true,
        ElIcon: true
      }
    }
  })

  it('挂载后应该加载我的失物列表', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(mockProfileApi.getMyLostItems).toHaveBeenCalled()
    expect(wrapper.vm.lostList.length).toBe(1)
    expect(wrapper.vm.username).toBe('alice')
  })

  it('切换到招领菜单应该加载我的招领列表', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.vm.handleMenuSelect('found')
    await flushPromises()

    expect(mockProfileApi.getMyFoundItems).toHaveBeenCalled()
    expect(wrapper.vm.activeMenu).toBe('found')
  })

  it('返回首页和退出登录应该跳转正确路由', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.goHome()
    expect(mockRouter.push).toHaveBeenCalledWith('/home')

    wrapper.vm.logout()
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })
})