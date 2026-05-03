// src/__tests__/unit/api/found.spec.js
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

import {
  getFoundList,
  getFoundDetail,
  publishFoundItem,
  updateFoundItem,
  deleteFoundItem,
  updateFoundStatus,
  getMyFoundItems
} from '@/api/found'
import axiosMock from '@/api/axios'

describe('招领 API 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== 成功场景 ==========

  it('getFoundList - 成功获取招领列表', async () => {
    const mockList = {
      items: [
        { id: 1, title: '捡到学生证', category: '证件' },
        { id: 2, title: '捡到钱包', category: '钱包' }
      ],
      total: 2
    }
    axiosMock.get.mockResolvedValue(mockList)

    const result = await getFoundList({ page: 1 })
    
    expect(axiosMock.get).toHaveBeenCalledWith('/found_item', { params: { page: 1 } })
    expect(result.items).toHaveLength(2)
  })

  it('getFoundDetail - 成功获取招领详情', async () => {
    const mockDetail = { id: 5, title: '捡到笔记本电脑', category: '电子产品' }
    axiosMock.get.mockResolvedValue(mockDetail)

    const result = await getFoundDetail(5)
    
    expect(axiosMock.get).toHaveBeenCalledWith('/found_item/5')
    expect(result.title).toBe('捡到笔记本电脑')
  })

  it('publishFoundItem - 成功发布招领', async () => {
    const mockResponse = { id: 10, success: true, message: '发布成功' }
    const newItem = { title: '捡到钥匙', category: '钥匙' }
    axiosMock.post.mockResolvedValue(mockResponse)

    const result = await publishFoundItem(newItem)
    
    expect(axiosMock.post).toHaveBeenCalledWith('/found_item', newItem)
    expect(result.success).toBe(true)
  })

  it('updateFoundItem - 成功更新招领', async () => {
    const mockResponse = { success: true, message: '更新成功' }
    const updateData = { title: '更新后的标题' }
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updateFoundItem(5, updateData)
    
    expect(axiosMock.put).toHaveBeenCalledWith('/found_item/5', updateData)
    expect(result.success).toBe(true)
  })

  it('deleteFoundItem - 成功删除招领', async () => {
    const mockResponse = { success: true, message: '删除成功' }
    axiosMock.delete.mockResolvedValue(mockResponse)

    const result = await deleteFoundItem(5)
    
    expect(axiosMock.delete).toHaveBeenCalledWith('/found_item/5')
    expect(result.success).toBe(true)
  })

  it('updateFoundStatus - 成功更新招领状态', async () => {
    const mockResponse = { success: true, message: '状态更新成功' }
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updateFoundStatus(5, 1)
    
    expect(axiosMock.put).toHaveBeenCalledWith('/found_item/5/status', null, {
      params: { status: 1 }
    })
    expect(result.success).toBe(true)
  })

  it('getMyFoundItems - 成功获取当前用户的招领', async () => {
    const mockItems = [
      { id: 1, title: '我捡到的物品1', status: 0 },
      { id: 2, title: '我捡到的物品2', status: 1 }
    ]
    axiosMock.get.mockResolvedValue(mockItems)

    const result = await getMyFoundItems()
    
    expect(axiosMock.get).toHaveBeenCalledWith('/found_item/my')
    expect(result).toHaveLength(2)
  })

  // ========== 失败场景 ==========

  it('getFoundDetail - 获取不存在的招领返回404', async () => {
    const error404 = { response: { status: 404, message: '招领信息不存在' } }
    axiosMock.get.mockRejectedValue(error404)
    
    await expect(getFoundDetail(99999)).rejects.toEqual(error404)
  })

  it('deleteFoundItem - 未登录时返回401', async () => {
    const error401 = { response: { status: 401, message: '未登录' } }
    axiosMock.delete.mockRejectedValue(error401)
    
    await expect(deleteFoundItem(5)).rejects.toEqual(error401)
  })

  it('publishFoundItem - 发布失败返回400', async () => {
    const error400 = { response: { status: 400, message: '标题不能为空' } }
    axiosMock.post.mockRejectedValue(error400)
    
    await expect(publishFoundItem({})).rejects.toEqual(error400)
  })
})