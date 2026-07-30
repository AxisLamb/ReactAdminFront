import request from '../utils/request'

/**
 * 角色管理接口
 */

/**
 * 分页查询角色列表（records 含 menuIds）
 * @param {{current?: number, size?: number, roleName?: string, status?: number}} params
 */
export function getRolePage(params) {
  return request.get('/sys/role/page', { params })
}

/**
 * 获取所有角色列表（下拉选择用）
 */
export function getRoles() {
  return request.get('/sys/role/roles')
}

/**
 * 新增角色并分配菜单权限
 * @param {{roleName, roleDesc, status, menuIds: number[]}} data
 */
export function addRole(data) {
  return request.post('/sys/role/add', data)
}

/**
 * 修改角色信息及权限
 * @param {{roleId, roleName, roleDesc, status, menuIds: number[]}} data
 */
export function updateRole(data) {
  return request.post('/sys/role/update', data)
}

/**
 * 删除角色
 * 注意：后端要求 id 为 Query 参数，如 POST /sys/role/delete?id=9
 * @param {number} id 角色ID
 */
export function deleteRole(id) {
  return request.post('/sys/role/delete', null, { params: { id } })
}
