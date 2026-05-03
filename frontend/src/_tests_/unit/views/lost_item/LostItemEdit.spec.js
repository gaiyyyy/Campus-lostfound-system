import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

vi.mock('@/views/lost_item/LostItemNew.vue', () => ({
  default: {
    template: '<div>编辑失物信息</div>'
  }
}))

import LostItemEdit from '@/views/lost_item/LostItemEdit.vue'

describe('LostItemEdit 包装页', () => {
  it('应该渲染编辑模式页面', () => {
    const wrapper = mount(LostItemEdit, {
      global: {
        stubs: {
          LostItemNew: {
            template: '<div>编辑失物信息</div>',
            props: ['isEdit']
          }
        }
      }
    })

    expect(wrapper.text()).toContain('编辑失物信息')
  })
})