import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'

describe('HelloWorld 组件', () => {
  it('应该渲染传入的消息', () => {
    const wrapper = mount(HelloWorld, {
      props: {
        msg: '测试消息'
      }
    })

    expect(wrapper.text()).toContain('测试消息')
  })

  it('点击按钮应该增加计数', async () => {
    const wrapper = mount(HelloWorld, {
      props: {
        msg: '计数测试'
      }
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.text()).toContain('count is 1')
  })
})