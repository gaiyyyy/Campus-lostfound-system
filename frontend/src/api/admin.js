// src/api/admin.js
import axios from './axios'

// 获取系统统计
export const getAdminStats = () => {
  return axios.get('/api/admin/stats')
}

// 获取所有失物信息（管理员）
export const getAllLostItems = (params = {}) => {
  return axios.get('/api/admin/lost-items', { params })
}

// 获取所有招领信息（管理员）
export const getAllFoundItems = (params = {}) => {
  return axios.get('/api/admin/found-items', { params })
}

// 管理员删除失物
export const adminDeleteLostItem = (id) => {
  return axios.delete(`/api/admin/lost-items/${id}`)
}

// 管理员删除招领
export const adminDeleteFoundItem = (id) => {
  return axios.delete(`/api/admin/found-items/${id}`)
}

// 获取所有用户
export const getAllUsers = () => {
  return axios.get('/api/admin/users')
}

// 更新用户角色
export const updateUserRole = (id, role) => {
  return axios.put(`/api/admin/users/${id}/role`, null, {
    params: { role }
  })
}