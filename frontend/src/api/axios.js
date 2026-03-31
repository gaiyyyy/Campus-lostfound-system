// src/api/axios.js
import axios from 'axios'
import router from '../router'
import { ElMessage } from 'element-plus'

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true
})

// 请求拦截器：自动加 token
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
})

// 响应拦截器：统一处理 401 / 失败消息
instance.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      ElMessage.error('未登录或登录过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error(err.response?.data?.message || '请求失败')
    }
    return Promise.reject(err)
  }
)

export default instance
