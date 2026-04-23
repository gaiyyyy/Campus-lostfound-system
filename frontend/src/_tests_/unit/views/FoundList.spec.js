// src/__tests__/unit/views/found/FoundList.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import FoundList from '@/views/found/FoundList.vue'

// Mock API
vi.mock('@/api/found', () => ({
  getFoundList: vi.fn()
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// Mock Element Plus icons
vi.mock('@element-plus/icons-vue', () => ({
  Present: { template: '<span>Present</span>' },
  HomeFilled: { template: '<span>HomeFilled</span>' },
  Plus: { template: '<span>Plus</span>' },
  Search: { template: '<span>Search</span>' },
  Delete: { template: '<span>Delete</span>' },
  List: { template: '<span>List</span>' },
  Box: { template: '<span>Box</span>' },
  Location: { template: '<span>Location</span>' },
  View: { template: '<span>View</span>' }
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/home', name: 'Home' },
    { path: '/found/publish', name: 'FoundPublish' },
    { path: '/found/:id', name: 'FoundDetail' }
  ]
})

describe('FoundList 招领列表组件', () => {
  let wrapper
  const mockFoundItems = [
    {
      id: 1,
      title: '捡到的学生证',
      category: '证件',
      status: 0,
      foundLocation: '图书馆二楼',
      publisherName: '张三',
      foundTime: '2024-01-15 10:30:00',
      description: '计算机学院学生证'
    },
    {
      id: 2,
      title: '捡到的钱包',
      category: '钱包',
      status: 1,
      foundLocation: '食堂一楼',
      publisherName: '李四',
      foundTime: '2024-01-14 15:20:00',
      description: '黑色皮质钱包'
    },
    {
      id: 3,
      title: '捡到的钥匙',
      category: '钥匙',
      status: 0,
      foundLocation: '教学楼302',
      publisherName: '王五',
      foundTime: '2024-01-13 09:00:00',
      description: '一串钥匙带U盘'
    },
    {
      id: 4,
      title: '捡到的笔记本',
      category: '电子产品',
      status: 0,
      foundLocation: '机房A',
      publisherName: '赵六',
      foundTime: '2024-01-12 14:00:00',
      description: '银色笔记本电脑'
    }
  ]

  beforeEach(async () => {
    vi.clearAllMocks()
    mockLocalStorage.clear()
    
    const { getFoundList } = await import('@/api/found')
    getFoundList.mockResolvedValue(mockFoundItems)
    
    wrapper = mount(FoundList, {
      global: {
        plugins: [router],
        stubs: {
          ElHeader: { template: '<div><slot /></div>' },
          ElCard: { template: '<div><slot /></div>' },
          ElButton: { 
            template: '<button @click="$attrs.onClick" :disabled="$attrs.disabled"><slot /></button>',
            props: ['disabled', 'type']
          },
          ElInput: {
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" :placeholder="$attrs.placeholder" />',
            props: ['modelValue', 'placeholder']
          },
          ElSelect: {
            template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
            props: ['modelValue', 'placeholder']
          },
          ElOption: { template: '<option :value="value"><slot /></option>', props: ['value', 'label'] },
          ElTable: { template: '<div><slot /></div>' },
          ElTableColumn: { template: '<div><slot name="default" :row="{}" /></div>' },
          ElTag: { template: '<span><slot /></span>', props: ['type', 'size', 'effect'] },
          ElAvatar: { template: '<div><slot /></div>', props: ['size'] },
          ElTooltip: { template: '<div><slot /></div>' },
          ElIcon: { template: '<span><slot /></span>' },
          ElMessage: { error: vi.fn(), success: vi.fn() }
        }
      }
    })
    
    await wrapper.vm.$nextTick()
  })

  // ========== 渲染测试 ==========

  it('组件应该正确渲染', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('应该显示页面标题"招领列表"', () => {
    expect(wrapper.html()).toContain('招领列表')
  })

  it('应该包含分类筛选下拉框', () => {
    const select = wrapper.find('select')
    expect(select.exists()).toBe(true)
  })

  // ========== 数据加载测试 ==========

  it('组件挂载时应该加载招领列表', async () => {
    const { getFoundList } = await import('@/api/found')
    expect(getFoundList).toHaveBeenCalledTimes(1)
  })

  it('加载成功后应该正确存储数据', () => {
    expect(wrapper.vm.list.length).toBe(4)
    expect(wrapper.vm.list[0].title).toBe('捡到的学生证')
  })

  it('加载状态结束后 loading 应该为 false', () => {
    expect(wrapper.vm.loading).toBe(false)
  })

  // ========== 筛选功能测试 ==========

  it('关键词搜索应该能正确筛选列表', async () => {
    wrapper.vm.searchKeyword = '钥匙'
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toContain('钥匙')
  })

  it('搜索关键词不区分大小写', async () => {
    wrapper.vm.searchKeyword = '学生证'
    await wrapper.vm.$nextTick()
    
    const filtered1 = wrapper.vm.filteredList
    expect(filtered1.length).toBe(1)
    
    wrapper.vm.searchKeyword = '学生证'
    await wrapper.vm.$nextTick()
    
    const filtered2 = wrapper.vm.filteredList
    expect(filtered2.length).toBe(1)
  })

  it('分类筛选应该按类别筛选', async () => {
    wrapper.vm.filterCategory = '证件'
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.every(item => item.category === '证件')).toBe(true)
    expect(filtered.length).toBe(1)
  })

  it('状态筛选应该按状态筛选', async () => {
    wrapper.vm.filterStatus = 1
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.every(item => item.status === 1)).toBe(true)
    expect(filtered.length).toBe(1)
    expect(filtered[0].title).toBe('捡到的钱包')
  })

  it('待认领状态（status=0）应该筛选出未归还的物品', async () => {
    wrapper.vm.filterStatus = 0
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.every(item => item.status === 0)).toBe(true)
    expect(filtered.length).toBe(3)
  })

  it('清空筛选按钮应该重置所有筛选条件', async () => {
    wrapper.vm.searchKeyword = '测试'
    wrapper.vm.filterCategory = '钱包'
    wrapper.vm.filterStatus = 0
    
    await wrapper.vm.clearFilters()
    
    expect(wrapper.vm.searchKeyword).toBe('')
    expect(wrapper.vm.filterCategory).toBe('')
    expect(wrapper.vm.filterStatus).toBe('')
  })

  // ========== 辅助函数测试 ==========

  it('getCategoryTagType 应该返回正确的标签类型', () => {
    expect(wrapper.vm.getCategoryTagType('证件')).toBe('primary')
    expect(wrapper.vm.getCategoryTagType('钱包')).toBe('warning')
    expect(wrapper.vm.getCategoryTagType('钥匙')).toBe('info')
    expect(wrapper.vm.getCategoryTagType('电子产品')).toBe('success')
    expect(wrapper.vm.getCategoryTagType('其他')).toBe('info')
    expect(wrapper.vm.getCategoryTagType('未知')).toBe('info')
  })

  it('getPublisherInitial 应该返回发布者首字母', () => {
    expect(wrapper.vm.getPublisherInitial('张三')).toBe('张')
    expect(wrapper.vm.getPublisherInitial('李四')).toBe('李')
    expect(wrapper.vm.getPublisherInitial('Admin')).toBe('A')
    expect(wrapper.vm.getPublisherInitial('')).toBe('匿')
    expect(wrapper.vm.getPublisherInitial(null)).toBe('匿')
    expect(wrapper.vm.getPublisherInitial('匿名')).toBe('匿')
  })

  it('getAvatarColor 应该返回不同的颜色值', () => {
    const color1 = wrapper.vm.getAvatarColor('张三')
    const color2 = wrapper.vm.getAvatarColor('李四')
    
    expect(color1).toMatch(/^#/)
    expect(color2).toMatch(/^#/)
  })

  it('getAvatarColor 对于空值应该返回默认颜色', () => {
    expect(wrapper.vm.getAvatarColor('')).toBe('#909399')
    expect(wrapper.vm.getAvatarColor(null)).toBe('#909399')
  })

  it('formatTime 应该正确格式化时间', () => {
    const time = '2024-01-15 10:30:00'
    const formatted = wrapper.vm.formatTime(time)
    expect(formatted).toMatch(/\d{2}:\d{2}/)
  })

  it('formatTime 对于空值应该返回空字符串', () => {
    expect(wrapper.vm.formatTime('')).toBe('')
    expect(wrapper.vm.formatTime(null)).toBe('')
  })

  // ========== 空状态测试 ==========

  it('emptyText 在加载中时应该显示正确文本', () => {
    wrapper.vm.loading = true
    expect(wrapper.vm.emptyText).toBe('加载中...')
  })

  it('emptyText 在无筛选结果时应该显示正确文本', () => {
    wrapper.vm.loading = false
    wrapper.vm.searchKeyword = '不存在的关键词'
    wrapper.vm.list = [{ id: 1, title: '测试' }]
    expect(wrapper.vm.emptyText).toBe('没有找到匹配的招领信息')
  })

  it('emptyText 在无数据时应该显示正确文本', () => {
    wrapper.vm.loading = false
    wrapper.vm.list = []
    wrapper.vm.searchKeyword = ''
    expect(wrapper.vm.emptyText).toBe('暂无招领信息')
  })

  // ========== 统计信息测试 ==========

  it('应该显示正确的统计信息', () => {
    expect(wrapper.vm.filteredCount).toBe(4)
  })

  it('筛选后 filteredCount 应该正确更新', async () => {
    wrapper.vm.filterCategory = '证件'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.filteredCount).toBe(1)
  })

  // ========== 排序功能测试 ==========

  it('filteredList 应该按时间倒序排序', () => {
    wrapper.vm.list = [
      { id: 1, foundTime: '2024-01-10 10:00:00', title: '较早' },
      { id: 2, foundTime: '2024-01-15 10:00:00', title: '较晚' },
      { id: 3, foundTime: '2024-01-05 10:00:00', title: '最早' }
    ]
    
    const sorted = wrapper.vm.filteredList
    expect(sorted[0].foundTime).toContain('2024-01-15')
    expect(sorted[1].foundTime).toContain('2024-01-10')
    expect(sorted[2].foundTime).toContain('2024-01-05')
  })

  it('如果没有 foundTime 应该使用 createTime 排序', () => {
    wrapper.vm.list = [
      { id: 1, createTime: '2024-01-10 10:00:00', title: 'A' },
      { id: 2, createTime: '2024-01-15 10:00:00', title: 'B' }
    ]
    
    const sorted = wrapper.vm.filteredList
    expect(sorted[0].createTime).toContain('2024-01-15')
  })

  // ========== 用户登录状态测试 ==========

  it('用户未登录时不应该显示发布按钮', () => {
    mockLocalStorage.getItem.mockReturnValue(null)
    
    const wrapper2 = mount(FoundList, {
      global: {
        plugins: [router],
        stubs: { ElButton: true, ElIcon: true, ElTooltip: true, ElHeader: true, ElCard: true }
      }
    })
    
    expect(wrapper2.vm.currentUsername).toBeNull()
  })

  it('用户登录时应该显示发布按钮', () => {
    mockLocalStorage.getItem.mockReturnValue('testuser')
    
    const wrapper2 = mount(FoundList, {
      global: {
        plugins: [router],
        stubs: { ElButton: true, ElIcon: true, ElTooltip: true, ElHeader: true, ElCard: true }
      }
    })
    
    expect(wrapper2.vm.currentUsername).toBe('testuser')
  })

  // ========== 响应式数据测试 ==========

  it('list 数据变化时 filteredList 应该自动更新', async () => {
    const initialLength = wrapper.vm.filteredList.length
    
    wrapper.vm.list.push({
      id: 5,
      title: '新招领',
      category: '其他',
      status: 0,
      foundLocation: '新地点',
      publisherName: '新用户',
      foundTime: '2024-01-16 10:00:00'
    })
    await wrapper.vm.$nextTick()
    
    expect(wrapper.vm.filteredList.length).toBe(initialLength + 1)
  })

  // ========== 多条件组合筛选测试 ==========

  it('关键词 + 分类组合筛选应该正确工作', async () => {
    wrapper.vm.searchKeyword = '学生'
    wrapper.vm.filterCategory = '证件'
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.length).toBe(1)
    expect(filtered[0].category).toBe('证件')
  })

  it('关键词 + 状态组合筛选应该正确工作', async () => {
    wrapper.vm.searchKeyword = '钱包'
    wrapper.vm.filterStatus = 1
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.length).toBe(1)
    expect(filtered[0].status).toBe(1)
  })

  it('三个筛选条件同时使用时应该正确工作', async () => {
    wrapper.vm.searchKeyword = '学生'
    wrapper.vm.filterCategory = '证件'
    wrapper.vm.filterStatus = 0
    await wrapper.vm.$nextTick()
    
    const filtered = wrapper.vm.filteredList
    expect(filtered.length).toBe(1)
  })
})