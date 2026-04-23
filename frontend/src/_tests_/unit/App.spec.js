import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App 根组件', () => {
  it('应该渲染路由出口', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: true
        }
      }
    })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.html()).toContain('router-view')
  })
})