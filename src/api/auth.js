import request from '../utils/request'

/**
 * 认证模块接口
 */

/**
 * 用户登录
 * @param {{username: string, password: string}} data
 * @returns {Promise<{token: string, userInfo: object}>}
 */
export function login(data) {
  return request.post('/auth/login', data)
}

/**
 * 退出登录
 */
export function logout() {
  return request.post('/auth/logout')
}
