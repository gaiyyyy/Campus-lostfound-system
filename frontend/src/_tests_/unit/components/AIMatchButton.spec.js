import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockPost = vi.hoisted(() => vi.fn())

vi.mock('axios', () => ({
  default: {
    post: mockPost
  }
}))

vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
  }
}))

vi.mock('@element-plus/icons-vue', () => ({
  MagicStick: { template: '<span>MagicStick</span>' },
  Loading: { template: '<span>Loading</span>' }
}))

import AIMatchButton from '@/components/AIMatchButton.vue'
import { ElMessage } from 'element-plus'

describe('AIMatchButton 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountButton = (props = {}) => {
    return mount(AIMatchButton, {
      props: {
        itemType: 'lost',
        itemId: 12,
        itemTitle: '校园卡',
        ...props
      },
      global: {
        stubs: {
          ElButton: {
            template: '<button @click="$attrs.onClick"><slot /></button>'
          },
          ElDialog: {
            template: '<div><slot /><slot name="footer" /></div>',
            props: ['modelValue', 'title', 'width']
          },
          ElAlert: {
            template: '<div>{{ title }}</div>',
            props: ['title', 'type', 'closable']
          },
          ElIcon: { template: '<span><slot /></span>' }
        }
      }
    })
  }

  it('应该根据物品类型显示不同按钮文案', () => {
    const wrapper = mountButton({ itemType: 'found' })
    expect(wrapper.text()).toContain('AI匹配失主')
  })

  it('点击按钮后应该调用招领匹配接口并写入结果', async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        aiResponse: '匹配到一条结果'
      }
    })

    const wrapper = mountButton({ itemType: 'lost', itemId: 18 })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(mockPost).toHaveBeenCalledWith('/api/ai/match-lost/18')
    expect(wrapper.vm.dialogVisible).toBe(true)
    expect(wrapper.vm.matchResult).toEqual({
      success: true,
      aiResponse: '匹配到一条结果'
    })
  })

  it('接口失败时应该显示默认错误消息', async () => {
    mockPost.mockRejectedValue({
      response: {
        data: {
          message: '后端服务异常'
        }
      }
    })

    const wrapper = mountButton({ itemType: 'found', itemId: 33 })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(mockPost).toHaveBeenCalledWith('/api/ai/match-found/33')
    expect(wrapper.vm.matchResult).toEqual({
      success: false,
      message: '后端服务异常'
    })
    expect(ElMessage.error).toHaveBeenCalledWith('AI匹配失败，请稍后重试')
  })
})