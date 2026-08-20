import axios from 'axios'
import { message } from 'antd'
import { getStorage, removeStorage, STORAGE_KEYS } from '@/utils/storage'

/**
 * Axios 实例
 * baseURL 取环境变量 VITE_API_BASE_URL（默认 /api），
 * 由 Vite 代理转发到后端 http://localhost:8888（rewrite 去除 /api 前缀）
 */
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// 防止并行 401 重复通知
let unauthorizedNotified = false

/**
 * 认证失效统一处理：清空本地登录态，并派发 auth:unauthorized 事件
 * 由 App.jsx 中的 AuthEventListener 监听事件、清理 zustand 状态并跳转登录页
 * 不直接 import userStore，避免 request → store → api → request 循环依赖
 */
function redirectToLogin() {
  removeStorage(STORAGE_KEYS.TOKEN)
  removeStorage(STORAGE_KEYS.USER_INFO)
  removeStorage(STORAGE_KEYS.PERMISSIONS)
  if (unauthorizedNotified) return
  unauthorizedNotified = true
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  setTimeout(() => {
    unauthorizedNotified = false
  }, 1000)
}

// 请求拦截器：自动注入 satoken
service.interceptors.request.use(
  (config) => {
    const token = getStorage(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers['satoken'] = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器：统一解包 {code, msg, data}，处理 401 与错误提示
service.interceptors.response.use(
  (response) => {
    const res = response.data
    // 文件流等非标准响应直接返回
    if (response.config.responseType === 'blob') {
      return response
    }
    // 兼容部分接口直接返回原始数据的情况
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 0) {
        return res.data
      }
      // 401 未登录/Token 过期
      if (res.code === 401) {
        redirectToLogin()
        return Promise.reject(new Error(res.msg || '未登录'))
      }
      message.error(res.msg || '请求失败')
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  (error) => {
    // HTTP 层错误处理
    const status = error.response?.status
    if (status === 401) {
      redirectToLogin()
    } else if (status === 403) {
      message.error('无权限访问')
    } else if (status === 500) {
      message.error('服务器内部错误')
    } else if (error.code === 'ECONNABORTED') {
      message.error('请求超时，请稍后重试')
    } else if (!error.response) {
      message.error('网络连接异常，请检查网络')
    } else {
      message.error(error.response?.data?.msg || '请求失败')
    }
    return Promise.reject(error)
  },
)

/**
 * 下载文件流助手
 * @param {string} url 请求地址（相对 baseURL）
 * @param {string} filename 下载文件名
 * @param {object} params 额外配置
 */
export async function downloadBlob(url, filename = 'download', params = {}) {
  const response = await service.get(url, {
    responseType: 'blob',
    ...params,
  })
  const blob = new Blob([response.data])
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export default service
