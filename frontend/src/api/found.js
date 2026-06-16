// src/api/found.js
import axios from './axios'

// 获取招领列表
export const getFoundList = (params = {}) => {
  return axios.get('/api/found_item', { params })
}

// 获取招领详情
export const getFoundDetail = id => {
  return axios.get(`/api/found_item/${id}`)
}

// 发布招领
export const publishFoundItem = data => {
  return axios.post('/api/found_item', data)
}

// 编辑招领
export const updateFoundItem = (id, data) => {
  return axios.put(`/api/found_item/${id}`, data)
}

// 删除招领
export const deleteFoundItem = id => {
  return axios.delete(`/api/found_item/${id}`)
}

// 更新状态
export const updateFoundStatus = (id, status) => {
  return axios.put(`/api/found_item/${id}/status`, null, {
    params: { status }
  })
}

// 获取当前用户发布的招领
export const getMyFoundItems = () => {
  return axios.get('/api/found_item/my')
}