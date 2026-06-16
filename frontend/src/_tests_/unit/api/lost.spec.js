// src/__tests__/unit/api/lost.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

// 注意：根据你提供的文件，失物 API 是从 @/api/lost 导入的
import {
  getLostItemList,
  getLostItemDetail,
  createLostItem,
  updateLostItem,
  deleteLostItem,
  updateLostItemStatus,
  getMyLostItems
} from '@/api/lostItem'
import axiosMock from '@/api/axios'

describe('失物 API 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== 成功场景 ==========

  it('getLostItemList - 成功获取失物列表', async () => {
    const mockList = {
      items: [{ id: 1, title: '丢失的书包', category: '个人物品' }],
      total: 1
    }
    axiosMock.get.mockResolvedValue(mockList)

    const result = await getLostItemList({ page: 1 })
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/lost_item', { params: { page: 1 } })
    expect(result.items).toHaveLength(1)
  })

  it('getLostItemDetail - 成功获取失物详情', async () => {
    const mockDetail = { id: 3, title: '丢失的耳机', category: '电子产品' }
    axiosMock.get.mockResolvedValue(mockDetail)

    const result = await getLostItemDetail(3)
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/lost_item/3')
    expect(result.title).toBe('丢失的耳机')
  })

  it('createLostItem - 成功发布失物', async () => {
    const mockResponse = { id: 8, success: true, message: '发布成功' }
    const newLost = { title: '丢失的钱包', category: '钱包' }
    axiosMock.post.mockResolvedValue(mockResponse)

    const result = await createLostItem(newLost)
    
    expect(axiosMock.post).toHaveBeenCalledWith('/api/lost_item', newLost)
    expect(result.success).toBe(true)
  })

  it('updateLostItem - 成功更新失物信息', async () => {
    const mockResponse = { success: true, message: '更新成功' }
    const updateData = { description: '补充描述' }
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updateLostItem(3, updateData)
    
    expect(axiosMock.put).toHaveBeenCalledWith('/api/lost_item/3', updateData)
    expect(result.success).toBe(true)
  })

  it('deleteLostItem - 成功删除失物', async () => {
    const mockResponse = { success: true, message: '删除成功' }
    axiosMock.delete.mockResolvedValue(mockResponse)

    const result = await deleteLostItem(8)
    
    expect(axiosMock.delete).toHaveBeenCalledWith('/api/lost_item/8')
    expect(result.success).toBe(true)
  })

  it('updateLostItemStatus - 成功更新状态为已找回', async () => {
    const mockResponse = { success: true, message: '状态更新成功' }
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updateLostItemStatus(3, 1)
    
    expect(axiosMock.put).toHaveBeenCalledWith('/api/lost_item/3/status', null, {
      params: { status: 1 }
    })
    expect(result.success).toBe(true)
  })

  it('getMyLostItems - 成功获取当前用户发布的失物', async () => {
    const mockItems = [{ id: 1, title: '我丢的手机', status: 0 }]
    axiosMock.get.mockResolvedValue(mockItems)

    const result = await getMyLostItems()
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/lost_item')
    expect(result).toHaveLength(1)
  })

  // ========== 失败场景 ==========

  it('getLostItemDetail - 获取不存在的失物返回404', async () => {
    const error404 = { response: { status: 404, message: '失物信息不存在' } }
    axiosMock.get.mockRejectedValue(error404)
    
    await expect(getLostItemDetail(99999)).rejects.toEqual(error404)
  })

  it('deleteLostItem - 无权限删除他人失物返回403', async () => {
    const error403 = { response: { status: 403, message: '无权删除他人信息' } }
    axiosMock.delete.mockRejectedValue(error403)
    
    await expect(deleteLostItem(1)).rejects.toEqual(error403)
  })

  it('createLostItem - 发布失败返回400', async () => {
    const error400 = { response: { status: 400, message: '标题不能为空' } }
    axiosMock.post.mockRejectedValue(error400)
    
    await expect(createLostItem({})).rejects.toEqual(error400)
  })
})