// src/__tests__/unit/api/admin.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

import {
  getAdminStats,
  getAllLostItems,
  getAllFoundItems,
  adminDeleteLostItem,
  adminDeleteFoundItem,
  getAllUsers,
  updateUserRole
} from '@/api/admin'
import axiosMock from '@/api/axios'

describe('管理员 API 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== 成功场景 ==========

  it('getAdminStats - 成功获取系统统计', async () => {
    const mockStats = {
      totalUsers: 150,
      totalLost: 45,
      totalFound: 38,
      resolvedCount: 20
    }
    // 注意：axios 拦截器做了 res => res.data，所以直接返回数据
    axiosMock.get.mockResolvedValue(mockStats)

    const result = await getAdminStats()
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/admin/stats')
    expect(result).toEqual(mockStats)
  })

  it('getAllLostItems - 成功获取所有失物', async () => {
    const mockData = [
      { id: 1, title: '钱包', username: 'user1', status: 0 }
    ]
    axiosMock.get.mockResolvedValue(mockData)

    const result = await getAllLostItems({ page: 1, size: 10 })
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/admin/lost-items', { params: { page: 1, size: 10 } })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('钱包')
  })

  it('getAllFoundItems - 成功获取所有招领', async () => {
    const mockData = [{ id: 1, title: '捡到学生证' }]
    axiosMock.get.mockResolvedValue(mockData)

    const result = await getAllFoundItems({ category: '证件' })
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/admin/found-items', { params: { category: '证件' } })
    expect(result).toHaveLength(1)
  })

  it('adminDeleteLostItem - 成功删除失物', async () => {
    const mockResponse = { success: true, message: '删除成功' }
    axiosMock.delete.mockResolvedValue(mockResponse)

    const result = await adminDeleteLostItem(123)
    
    expect(axiosMock.delete).toHaveBeenCalledWith('/api/admin/lost-items/123')
    expect(result.success).toBe(true)
  })

  it('adminDeleteFoundItem - 成功删除招领', async () => {
    const mockResponse = { success: true, message: '删除成功' }
    axiosMock.delete.mockResolvedValue(mockResponse)

    const result = await adminDeleteFoundItem(456)
    
    expect(axiosMock.delete).toHaveBeenCalledWith('/api/admin/found-items/456')
    expect(result.success).toBe(true)
  })

  it('getAllUsers - 成功获取所有用户', async () => {
    const mockUsers = [{ id: 1, username: 'admin', role: 'admin' }]
    axiosMock.get.mockResolvedValue(mockUsers)

    const result = await getAllUsers()
    
    expect(axiosMock.get).toHaveBeenCalledWith('/api/admin/users')
    expect(result).toHaveLength(1)
  })

  it('updateUserRole - 成功更新用户角色', async () => {
    const mockResponse = { success: true, message: '角色更新成功' }
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updateUserRole(2, 'admin')
    
    expect(axiosMock.put).toHaveBeenCalledWith('/api/admin/users/2/role', null, {
      params: { role: 'admin' }
    })
    expect(result.success).toBe(true)
  })

  // ========== 失败场景 ==========

  it('getAdminStats - 网络错误时应该抛出异常', async () => {
    axiosMock.get.mockRejectedValue(new Error('Network Error'))
    
    await expect(getAdminStats()).rejects.toThrow('Network Error')
  })

  it('adminDeleteLostItem - 删除不存在的物品返回404', async () => {
    const error404 = { response: { status: 404, message: '物品不存在' } }
    axiosMock.delete.mockRejectedValue(error404)
    
    await expect(adminDeleteLostItem(99999)).rejects.toEqual(error404)
  })

  it('adminDeleteFoundItem - 无权限删除返回403', async () => {
    const error403 = { response: { status: 403, message: '无权限操作' } }
    axiosMock.delete.mockRejectedValue(error403)
    
    await expect(adminDeleteFoundItem(456)).rejects.toEqual(error403)
  })

  it('updateUserRole - 更新不存在的用户返回404', async () => {
    const error404 = { response: { status: 404, message: '用户不存在' } }
    axiosMock.put.mockRejectedValue(error404)
    
    await expect(updateUserRole(999, 'admin')).rejects.toEqual(error404)
  })
})