import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockAdminApi = vi.hoisted(() => ({
  getAdminStats: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter
}))

vi.mock('@/api/admin', () => ({
  getAdminStats: mockAdminApi.getAdminStats
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@element-plus/icons-vue', () => ({
  User: { template: '<span>User</span>' },
  Box: { template: '<span>Box</span>' },
  Present: { template: '<span>Present</span>' },
  Setting: { template: '<span>Setting</span>' },
  HomeFilled: { template: '<span>HomeFilled</span>' },
  Refresh: { template: '<span>Refresh</span>' },
  DataAnalysis: { template: '<span>DataAnalysis</span>' },
  Operation: { template: '<span>Operation</span>' },
  Monitor: { template: '<span>Monitor</span>' }
}))

import AdminDashboard from '@/views/admin/AdminDashboard.vue'

describe('AdminDashboard 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdminApi.getAdminStats.mockResolvedValue({
      totalUsers: 10,
      adminUsers: 2,
      totalLostItems: 4,
      pendingLostItems: 3,
      resolvedLostItems: 1,
      totalFoundItems: 5,
      pendingFoundItems: 4,
      resolvedFoundItems: 1
    })
  })

  const mountPage = () => mount(AdminDashboard, {
    global: {
      stubs: {
        ElHeader: true,
        ElTooltip: true,
        ElButton: true,
        ElCard: true,
        ElIcon: true
      }
    }
  })

  it('挂载后应该加载统计信息', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(mockAdminApi.getAdminStats).toHaveBeenCalled()
    expect(wrapper.vm.stats.totalUsers).toBe(10)
  })

  it('刷新和返回首页应该触发正确动作', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.goHome()
    expect(mockRouter.push).toHaveBeenCalledWith('/home')

    await wrapper.vm.refreshStats()
    expect(mockAdminApi.getAdminStats).toHaveBeenCalledTimes(2)
  })

  it('管理员比例计算应该正确', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.vm.calculateAdminRatio()).toBe(20)
  })
})