import request from '../utils/request'

/**
 * 系统配置模块 API
 * 当前仅包含登录页轮播图相关接口
 */

/**
 * 上传登录页轮播图片
 * 后端校验：仅限图片、大小不超过 5MB；businessType 固定为 loginPage
 * @param {File} file 图片文件
 * @param {(percent: number) => void} [onProgress] 上传进度回调（0-100）
 * @returns {Promise<object>} 上传结果（FileUploadResult）
 */
export function uploadLoginPageImage(file, onProgress) {
  const form = new FormData()
  form.append('file', file)
  return request.post('/sys/config/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 0,
    onUploadProgress: (e) => {
      if (e.total && typeof onProgress === 'function') {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
}

/**
 * 查询登录页轮播图片 URL 列表
 * 免登录接口（后端 @SaIgnore），供登录页轮播使用
 * @returns {Promise<string[]>} 图片访问 URL 数组
 */
export function getLoginPageImages() {
  return request.get('/sys/config/loginPageList')
}
