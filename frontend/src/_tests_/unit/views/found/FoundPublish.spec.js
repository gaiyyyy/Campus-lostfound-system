import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockRouter = {
  push: vi.fn()
}

const mockRoute = {
  params: {},
  query: {},
  name: 'FoundPublish'
}

const mockFoundApi = vi.hoisted(() => ({
  publishFoundItem: vi.fn(),
  updateFoundItem: vi.fn(),
  getFoundDetail: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute
}))

vi.mock('@/api/found', () => ({
  publishFoundItem: mockFoundApi.publishFoundItem,
  updateFoundItem: mockFoundApi.updateFoundItem,
  getFoundDetail: mockFoundApi.getFoundDetail
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
  Check: { template: '<span>Check</span>' },
  Upload: { template: '<span>Upload</span>' },
  Delete: { template: '<span>Delete</span>' }
}))

import FoundPublish from '@/views/found/FoundPublish.vue'

describe('FoundPublish 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRoute.params = {}
    mockRoute.query = {}
    mockRoute.name = 'FoundPublish'
    mockFoundApi.publishFoundItem.mockResolvedValue({})
    mockFoundApi.updateFoundItem.mockResolvedValue({})
    mockFoundApi.getFoundDetail.mockResolvedValue({})
    localStorage.setItem('userId', '7')
  })

  const mountPage = (props = {}) => {
    return mount(FoundPublish, {
      props,
      global: {
        stubs: {
          ElHeader: { template: '<header><slot /></header>' },
          ElCard: { template: '<div><slot /></div>' },
          ElTooltip: { template: '<div><slot /></div>' },
          ElButton: {
            template: '<button @click="$attrs.onClick"><slot /></button>',
            props: ['loading', 'type']
          },
          ElForm: { template: '<form><slot /></form>' },
          ElFormItem: { template: '<div><slot /></div>' },
          ElInput: {
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: ['modelValue']
          },
          ElSelect: {
            template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue']
          },
          ElOption: { template: '<option :value="value"><slot /></option>', props: ['value', 'label'] },
          ElDatePicker: { template: '<input />', props: ['modelValue'] },
          ElIcon: { template: '<span><slot /></span>' }
        }
      }
    })
  }

  it('新建模式应该显示发布招领信息标题', () => {
    const wrapper = mountPage()
    expect(wrapper.text()).toContain('发布招领信息')
  })

  it('提交新招领时应该调用发布接口并跳转列表', async () => {
    const wrapper = mountPage()
    wrapper.vm.form.title = '捡到的学生证'
    wrapper.vm.form.category = '证件'
    wrapper.vm.form.foundLocation = '食堂'
    wrapper.vm.form.foundTime = '2024-01-15 10:30:00'
    wrapper.vm.form.description = '蓝色学生证'
    wrapper.vm.formRef = {
      validate: vi.fn().mockResolvedValue(true)
    }

    await wrapper.vm.handleSubmit()
    await flushPromises()

    expect(mockFoundApi.publishFoundItem).toHaveBeenCalled()
    expect(mockRouter.push).toHaveBeenCalledWith('/found')
  })

  it('编辑模式应该加载详情并支持跳转详情页', async () => {
    mockRoute.name = 'FoundEdit'
    mockRoute.params = { id: '8' }
    mockRoute.query = { from: 'profile' }
    mockFoundApi.getFoundDetail.mockResolvedValue({
      id: 8,
      title: '捡到钱包',
      category: '钱包',
      foundLocation: '图书馆',
      foundTime: '2024-01-12 09:00:00',
      description: '黑色钱包'
    })

    const wrapper = mountPage({})
    await flushPromises()

    expect(mockFoundApi.getFoundDetail).toHaveBeenCalledWith('8')
    expect(wrapper.vm.form.id).toBe(8)

    wrapper.vm.goBack()
    expect(mockRouter.push).toHaveBeenCalledWith('/found')
  })
})