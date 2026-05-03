import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockAdminApi = vi.hoisted(() => ({
  getAllUsers: vi.fn(),
  updateUserRole: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

vi.mock('@/api/admin', () => ({
  getAllUsers: mockAdminApi.getAllUsers,
  updateUserRole: mockAdminApi.updateUserRole
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
  User: { template: '<span>User</span>' },
  Setting: { template: '<span>Setting</span>' },
  Avatar: { template: '<span>Avatar</span>' },
  PieChart: { template: '<span>PieChart</span>' },
  Back: { template: '<span>Back</span>' },
  Refresh: { template: '<span>Refresh</span>' },
  DataAnalysis: { template: '<span>DataAnalysis</span>' },
  List: { template: '<span>List</span>' },
  Star: { template: '<span>Star</span>' }
}))

import UserManagement from '@/views/admin/UserManagement.vue'

describe('UserManagement 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminApi.getAllUsers.mockResolvedValue([
      { id: 1, username: 'admin', role: 'admin', contact: '1', createTime: '2024-01-01 10:00:00' },
      { id: 2, username: 'user1', role: 'user', contact: '2', createTime: '2024-01-02 10:00:00' }
    ])
    mockAdminApi.updateUserRole.mockResolvedValue({})
  })

  const mountPage = () => mount(UserManagement, {
    global: {
      stubs: {
        ElHeader: true,
        ElCard: true,
        ElTooltip: true,
        ElButton: true,
        ElTable: true,
        ElTableColumn: true,
        ElTag: true,
        ElAvatar: true,
        ElIcon: true
      }
    }
  })

  it('挂载后应该加载用户列表', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(mockAdminApi.getAllUsers).toHaveBeenCalled()
    expect(wrapper.vm.userList.length).toBe(2)
    expect(wrapper.vm.adminCount).toBe(1)
    expect(wrapper.vm.userCount).toBe(1)
  })

  it('切换用户角色应该调用更新接口', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.vm.toggleUserRole({ id: 2, username: 'user1', role: 'user' })
    expect(mockAdminApi.updateUserRole).toHaveBeenCalledWith(2, 'admin')
  })

  it('刷新和返回按钮应该触发正确操作', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.refresh()
    expect(mockAdminApi.getAllUsers).toHaveBeenCalledTimes(2)

    wrapper.vm.goBack()
    expect(mockRouter.push).toHaveBeenCalledWith('/admin')
  })
})