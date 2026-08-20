import request from '@/utils/request'

/**
 * 用户管理接口
 */

/**
 * 分页查询用户列表
 * @param {{current?: number, size?: number, username?: string, realName?: string, status?: number}} params
 */
export function getUserPage(params) {
  return request.get('/sys/user/page', { params })
}

/**
 * 获取当前登录用户详细信息（含 role 对象）
 */
export function getUserInfo() {
  return request.get('/sys/user/info')
}

/**
 * 新增用户
 * @param {{username, password, realName, email, mobile, roleId, status}} data
 */
export function saveUser(data) {
  return request.post('/sys/user/save', data)
}

/**
 * 修改用户
 * @param {{userId, username, realName, email, mobile, roleId, status}} data
 */
export function updateUser(data) {
  return request.post('/sys/user/update', data)
}

/**
 * 批量删除用户
 * 注意：后端要求 body 为用户ID数组，如 [3, 4, 5]
 * @param {number[]} ids 用户ID数组
 */
export function deleteUsers(ids) {
  return request.post('/sys/user/delete', ids)
}

/**
 * 获取用户头像访问链接
 * @param {string} businessType 业务类型（如 avatar）
 * @returns {Promise<string>} URL 字符串
 */
export function getUserAvatarUrl() {
  return request.get('/sys/user/url')
}

/**
 * 上传用户头像
 * @param {File} file 图片对象
 * @param {(percent: number) => void} onProgress 进度回调（0-100）
 * @returns {Promise<{fileId, originalName, fileSize, fileType, filePath}>}
 */
export function uploadAvatar(file, meta = {}, onProgress) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/sys/user/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
}

