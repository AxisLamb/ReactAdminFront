import request from '../utils/request'

/**
 * 仪表盘统计接口
 */

/**
 * 获取统计数据（用户、角色、菜单、字典总数）
 * 需要 sys:dashboard:list 权限
 * @returns {Promise<{userCount: number, roleCount: number, menuCount: number, dictCount: number}>}
 */
export function getDashboardStatistics() {
  return request.get('/sys/dashboard/statistics')
}
