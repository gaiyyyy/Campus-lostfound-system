import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockRoute = {
  params: { id: '5' },
  query: {},
  path: '/found/5'
}

const mockFoundApi = vi.hoisted(() => ({
  getFoundDetail: vi.fn(),
  deleteFoundItem: vi.fn(),
  updateFoundStatus: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

vi.mock('@/api/found', () => ({
  getFoundDetail: mockFoundApi.getFoundDetail,
  deleteFoundItem: mockFoundApi.deleteFoundItem,
  updateFoundStatus: mockFoundApi.updateFoundStatus
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
  Present: { template: '<span>Present</span>' },
  Back: { template: '<span>Back</span>' },
  Loading: { template: '<span>Loading</span>' },
  Box: { template: '<span>Box</span>' },
  Edit: { template: '<span>Edit</span>' },
  Check: { template: '<span>Check</span>' },
  Delete: { template: '<span>Delete</span>' },
  InfoFilled: { template: '<span>InfoFilled</span>' },
  Location: { template: '<span>Location</span>' },
  Clock: { template: '<span>Clock</span>' },
  UserFilled: { template: '<span>UserFilled</span>' },
  Phone: { template: '<span>Phone</span>' },
  Calendar: { template: '<span>Calendar</span>' },
  Document: { template: '<span>Document</span>' },
  Picture: { template: '<span>Picture</span>' }
}))

import FoundDetail from '@/views/found/FoundDetail.vue'

describe('FoundDetail 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params = { id: '5' }
    mockRoute.query = {}
    mockFoundApi.getFoundDetail.mockResolvedValue({
      id: 5,
      title: '捡到的耳机',
      category: '电子产品',
      status: 0,
      foundLocation: '机房',
      publisherName: '张三',
      foundTime: '2024-01-15 10:30:00',
      description: '白色耳机'
    })
    mockFoundApi.deleteFoundItem.mockResolvedValue({})
    mockFoundApi.updateFoundStatus.mockResolvedValue({})
    localStorage.setItem('username', '张三')
  })

  const mountPage = () => mount(FoundDetail, {
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

    expect(mockFoundApi.getFoundDetail).toHaveBeenCalledWith('5')
    expect(wrapper.text()).toContain('捡到的耳机')
  })

  it('goBack 应该返回招领列表', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.goBack()
    expect(mockRouter.push).toHaveBeenCalledWith('/found')
  })

  it('handleEdit 应该跳转编辑页', async () => {
    const wrapper = mountPage()
    await flushPromises()

    wrapper.vm.handleEdit()
    expect(mockRouter.push).toHaveBeenCalledWith('/found/edit/5')
  })

  it('updateStatus 应该调用接口并刷新详情', async () => {
    const wrapper = mountPage()
    await flushPromises()

    await wrapper.vm.updateStatus(1)
    await flushPromises()

    expect(mockFoundApi.updateFoundStatus).toHaveBeenCalledWith(5, 1)
  })
})