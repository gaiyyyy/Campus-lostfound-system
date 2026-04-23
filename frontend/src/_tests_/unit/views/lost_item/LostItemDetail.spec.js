import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockRoute = {
  params: { id: '5' },
  query: {},
  path: '/lost_item/5'
}

const mockLostItemApi = vi.hoisted(() => ({
  getLostItemDetail: vi.fn(),
  deleteLostItem: vi.fn(),
  updateLostItemStatus: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

vi.mock('@/api/lostItem', () => ({
  getLostItemDetail: mockLostItemApi.getLostItemDetail,
  deleteLostItem: mockLostItemApi.deleteLostItem,
  updateLostItemStatus: mockLostItemApi.updateLostItemStatus
}))

vi.mock('@/components/AIMatchButton.vue', () => ({
  default: { template: '<div>AIMatchButton</div>' }
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
  Box: { template: '<span>Box</span>' },
  Back: { template: '<span>Back</span>' },
  Loading: { template: '<span>Loading</span>' },
  Edit: { template: '<span>Edit</span>' },
  Check: { template: '<span>Check</span>' },
  Delete: { template: '<span>Delete</span>' },
  InfoFilled: { template: '<span>InfoFilled</span>' },
  Location: { template: '<span>Location</span>' },
  Clock: { template: '<span>Clock</span>' },
  UserFilled: { template: '<span>UserFilled</span>' },
  Calendar: { template: '<span>Calendar</span>' },
  Document: { template: '<span>Document</span>' },
  Picture: { template: '<span>Picture</span>' },
  Phone: { template: '<span>Phone</span>' }
}))

import LostItemDetail from '@/views/lost_item/LostItemDetail.vue'

describe('LostItemDetail 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params = { id: '5' }
    mockRoute.query = {}
    mockLostItemApi.getLostItemDetail.mockResolvedValue({
      id: 5,
      title: '丢失的钱包',
      category: '钱包',
      status: 0,
      lostLocation: '图书馆',
      username: '张三',
      lostTime: '2024-01-15 10:30:00',
      description: '黑色钱包'
    })
    mockLostItemApi.deleteLostItem.mockResolvedValue({})
    mockLostItemApi.updateLostItemStatus.mockResolvedValue({})
    localStorage.setItem('username', '张三')
  })

  const mountPage = () => mount(LostItemDetail, {
    global: {
      stubs: {
        ElHeader: { template: '<header><slot /></header>' },
        ElTooltip: { template: '<div><slot /></div>' },
        ElButton: {
          template: '<button @click="$attrs.onClick"><slot /></button>',
          props: ['type', 'size']
        },
        ElButtonGroup: { template: '<div><slot /></div>' },
        ElCard: { template: '<div><slot /></div>' },
        ElTag: { template: '<span><slot /></span>' },
        ElImage: { template: '<img />' },
        ElTimeline: { template: '<div><slot /></div>' },
        ElTimelineItem: { template: '<div><slot /></div>' },
        ElEmpty: { template: '<div><slot /></div>' },
        ElIcon: { template: '<span><slot /></span>' },
        AIMatchButton: { template: '<div />' }
      }
    }
  })

  it('挂载后应该加载详情', async () => {
    const wrapper = mountPage()
    await flushPromises()

    expect(mockLostItemApi.getLostItemDetail).toHaveBeenCalledWith('5')
    expect(wrapper.text()).toContain('丢失的钱包')
  })

  it('goList 应该返回失物列表', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.goList()
    expect(mockRouter.push).toHaveBeenCalledWith('/lost_item/list')
  })

  it('edit 应该跳转编辑页', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.edit()
    expect(mockRouter.push).toHaveBeenCalledWith({
      path: '/lost_item/edit/5',
      query: { redirect: '/lost_item/5' }
    })
  })

  it('markFound 应该调用状态更新接口', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.vm.markFound()
    await flushPromises()

    expect(mockLostItemApi.updateLostItemStatus).toHaveBeenCalledWith('5', 1)
  })
})