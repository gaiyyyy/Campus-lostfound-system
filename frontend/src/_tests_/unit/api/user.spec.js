// src/__tests__/unit/api/user.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/axios', () => ({
  default: {
    put: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    }
  }
}))

import { updateUsername, updatePassword } from '@/api/user'
import axiosMock from '@/api/axios'

describe('用户 API 测试', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ========== 成功场景 ==========

  it('updateUsername - 成功修改用户名', async () => {
    const mockResponse = { success: true, message: '用户名修改成功' }
    const newUsername = 'newname123'
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updateUsername(newUsername)
    
    expect(axiosMock.put).toHaveBeenCalledWith('/api/user/update-username', { newUsername })
    expect(result.success).toBe(true)
  })

  it('updatePassword - 成功修改密码', async () => {
    const mockResponse = { success: true, message: '密码修改成功' }
    axiosMock.put.mockResolvedValue(mockResponse)

    const result = await updatePassword('old123', 'new456')
    
    expect(axiosMock.put).toHaveBeenCalledWith('/api/user/update-password', { 
      oldPassword: 'old123', 
      newPassword: 'new456' 
    })
    expect(result.success).toBe(true)
  })

  // ========== 失败场景 ==========

  it('updateUsername - 新用户名已存在返回409', async () => {
    const error409 = { response: { status: 409, data: { message: '用户名已存在' } } }
    axiosMock.put.mockRejectedValue(error409)
    
    await expect(updateUsername('existingName')).rejects.toEqual(error409)
  })

  it('updatePassword - 旧密码错误返回400', async () => {
    const error400 = { response: { status: 400, data: { message: '原密码错误' } } }
    axiosMock.put.mockRejectedValue(error400)
    
    await expect(updatePassword('wrong', 'new123')).rejects.toEqual(error400)
  })

  it('updatePassword - 未登录状态返回401', async () => {
    const error401 = { response: { status: 401, data: { message: '未登录' } } }
    axiosMock.put.mockRejectedValue(error401)
    
    await expect(updatePassword('old', 'new')).rejects.toEqual(error401)
  })

  it('updateUsername - 网络错误', async () => {
    axiosMock.put.mockRejectedValue(new Error('Network Error'))
    
    await expect(updateUsername('test')).rejects.toThrow('Network Error')
  })
})