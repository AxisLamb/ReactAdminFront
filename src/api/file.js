import request, { downloadBlob } from '../utils/request'

/**
 * 文件管理接口
 */

/**
 * 上传文件（支持进度回调）
 * @param {File} file 文件对象
 * @param {{serviceModule?, businessType?, businessId?}} meta 业务信息
 * @param {(percent: number) => void} onProgress 进度回调（0-100）
 * @returns {Promise<{fileId, originalName, fileSize, fileType, filePath}>}
 */
export function uploadFile(file, meta = {}, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  if (meta.serviceModule) formData.append('serviceModule', meta.serviceModule)
  if (meta.businessType) formData.append('businessType', meta.businessType)
  if (meta.businessId) formData.append('businessId', meta.businessId)
  return request.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
}

/**
 * 下载文件（文件流）
 * @param {string} fileId 文件ID
 * @param {string} filename 下载文件名
 */
export function downloadFile(fileId, filename = 'download') {
  return downloadBlob(`/images/download/${fileId}`, filename)
}

/**
 * 获取文件访问链接
 * @param {string} fileId
 * @returns {Promise<string>} URL 字符串
 */
export function getFileUrl(fileId) {
  return request.get(`/images/url/${fileId}`)
}

/**
 * 下载文件流（返回 Blob，不触发浏览器下载）
 * /files 静态路径需鉴权，浏览器 <img> 无法直接访问，
 * 头像等需携带 satoken 拉取文件流的场景使用本接口
 * @param {string} fileId
 * @returns {Promise<Blob>}
 */
export function downloadFileBlob(fileId) {
  return request
    .get(`/images/download/${fileId}`, { responseType: 'blob' })
    .then((res) => res.data)
}

/**
 * 删除文件（DELETE 路径参数）
 * @param {string} fileId
 */
export function deleteFile(fileId) {
  return request.delete(`/images/${fileId}`)
}

/**
 * 查询文件列表（返回数组，非分页）
 * @param {{serviceModule?, businessType?, businessId?}} params
 */
export function getFileList(params) {
  return request.get('/images/list', { params })
}

/**
 * 查询文件分页数据（客户端分页包装）
 * @param {{current?, size?, serviceModule?, businessType?, businessId?}} params
 * @returns {Promise<{records, current, size, total}>}
 */
export function getFilePage(params = {}) {
  const { current = 1, size = 10, ...filters } = params
  return getFileList(filters).then((arr) => {
    const list = Array.isArray(arr) ? arr : []
    const total = list.length
    const start = (current - 1) * size
    const records = list.slice(start, start + size)
    return { records, current, size, total }
  })
}
