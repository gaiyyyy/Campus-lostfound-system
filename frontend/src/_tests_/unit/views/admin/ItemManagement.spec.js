import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockRoute = {
  path: '/admin/lost-items',
  query: {},
  params: {}
}

const mockAdminApi = vi.hoisted(() => ({
  getAllLostItems: vi.fn(),
  getAllFoundItems: vi.fn(),
  adminDeleteLostItem: vi.fn(),
  adminDeleteFoundItem: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

vi.mock('@/api/admin', () => ({
  getAllLostItems: mockAdminApi.getAllLostItems,
  getAllFoundItems: mockAdminApi.getAllFoundItems,
  adminDeleteLostItem: mockAdminApi.adminDeleteLostItem,
  adminDeleteFoundItem: mockAdminApi.adminDeleteFoundItem
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
  Search: { template: '<span>Search</span>' },
  Back: { template: '<span>Back</span>' },
  Refresh: { template: '<span>Refresh</span>' },
  Filter: { template: '<span>Filter</span>' },
  Delete: { template: '<span>Delete</span>' },
  View: { template: '<span>View</span>' },
  Box: { template: '<span>Box</span>' },
  Present: { template: '<span>Present</span>' },
  Location: { template: '<span>Location</span>' }
}))

import ItemManagement from '@/views/admin/ItemManagement.vue'

describe('ItemManagement 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.path = '/admin/lost-items'
    mockAdminApi.getAllLostItems.mockResolvedValue([
      { id: 1, title: '丢失的钱包', category: '钱包', status: 0, lostLocation: '图书馆', username: '张三', createTime: '2024-01-01 10:00:00' }
    ])
    mockAdminApi.getAllFoundItems.mockResolvedValue([
      { id: 2, title: '捡到的校园卡', category: '证件', status: 0, foundLocation: '食堂', username: '李四', createTime: '2024-01-02 10:00:00' }
    ])
    mockAdminApi.adminDeleteLostItem.mockResolvedValue({})
    mockAdminApi.adminDeleteFoundItem.mockResolvedValue({})
  })

  const mountPage = () => mount(ItemManagement, {
    global: {
      stubs: {
        ElHeader: true,
        ElCard: true,
        ElTooltip: true,
        ElButton: true,
        ElInput: true,
        ElSelect: true,
        ElOption: true,
        ElTable: true,
        ElTableColumn: true,
        ElTag: true,
        ElAvatar: true,
        ElIcon: true
      }
    }
  })

  it('挂载后应该加载失物数据并识别页面类型', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(mockAdminApi.getAllLostItems).toHaveBeenCalled()
    expect(wrapper.vm.isLost).toBe(true)
    expect(wrapper.vm.originalList.length).toBe(1)
  })

  it('筛选和跳转详情应该正常工作', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.searchKeyword = '钱包'
    expect(wrapper.vm.filteredList.length).toBe(1)

    wrapper.vm.viewDetail(1)
    expect(mockRouter.push).toHaveBeenCalledWith({
      path: '/lost_item/1',
      query: { redirect: '/admin/lost-items', from: 'admin' }
    })
  })

  it('刷新和返回按钮应该触发正确操作', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.refresh()
    expect(mockAdminApi.getAllLostItems).toHaveBeenCalledTimes(2)

    wrapper.vm.goBack()
    expect(mockRouter.push).toHaveBeenCalledWith('/admin')
  })
})