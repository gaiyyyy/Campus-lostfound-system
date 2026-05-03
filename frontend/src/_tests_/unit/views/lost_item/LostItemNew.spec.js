import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockRoute = {
  params: {},
  query: {},
  name: 'LostItemNew'
}

const mockLostItemApi = vi.hoisted(() => ({
  createLostItem: vi.fn(),
  updateLostItem: vi.fn(),
  getLostItemDetail: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

vi.mock('@/api/lostItem', () => ({
  createLostItem: mockLostItemApi.createLostItem,
  updateLostItem: mockLostItemApi.updateLostItem,
  getLostItemDetail: mockLostItemApi.getLostItemDetail
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('@element-plus/icons-vue', () => ({
  Edit: { template: '<span>Edit</span>' },
  Plus: { template: '<span>Plus</span>' },
  List: { template: '<span>List</span>' },
  View: { template: '<span>View</span>' },
  Check: { template: '<span>Check</span>' }
}))

import LostItemNew from '@/views/lost_item/LostItemNew.vue'

describe('LostItemNew 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params = {}
    mockRoute.query = {}
    mockRoute.name = 'LostItemNew'
    mockLostItemApi.getLostItemDetail.mockResolvedValue({})
    mockLostItemApi.createLostItem.mockResolvedValue({})
    mockLostItemApi.updateLostItem.mockResolvedValue({})
    localStorage.setItem('userId', '7')
  })

  const mountPage = (props = {}) => {
    return mount(LostItemNew, {
      props,
      global: {
        renderStubDefaultSlot: true,
        stubs: {
          ElHeader: true,
          ElCard: true,
          ElTooltip: true,
          ElButton: true,
          ElForm: true,
          ElFormItem: true,
          ElInput: true,
          ElSelect: true,
          ElOption: true,
          ElDatePicker: true,
          ElIcon: true
        }
      }
    })
  }

  it('新建模式应该显示发布失物信息标题', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('发布失物信息')
  })

  it('提交新失物时应该调用创建接口并跳转列表', async () => {
    const wrapper = mountPage()
    wrapper.vm.form.title = '丢失的校园卡'
    wrapper.vm.form.category = '证件'
    wrapper.vm.form.lostLocation = '图书馆'
    wrapper.vm.form.lostTime = '2024-01-15 10:30:00'
    wrapper.vm.form.description = '黑色校园卡'
    wrapper.vm.formRef = {
      validate: vi.fn().mockResolvedValue(true)
    }

    await wrapper.vm.submit()
    await flushPromises()

    expect(mockLostItemApi.createLostItem).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/lost_item/list')
  })

  it('编辑模式加载后应该填充表单并支持跳转详情', async () => {
    mockRoute.name = 'LostItemEdit'
    mockRoute.params = { id: '9' }
    mockLostItemApi.getLostItemDetail.mockResolvedValue({
      title: '丢失的耳机',
      category: '电子产品',
      lostLocation: '宿舍',
      lostTime: '2024-01-10 08:00:00',
      description: '白色耳机'
    })

    const wrapper = mountPage({ isEdit: true })
    await flushPromises()

    expect(mockLostItemApi.getLostItemDetail).toHaveBeenCalledWith('9')
    expect(wrapper.vm.form.title).toBe('丢失的耳机')

    wrapper.vm.goToDetail()
    expect(mockRouter.push).toHaveBeenCalledWith('/lost_item/9')
  })
})