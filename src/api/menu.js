import request from '../utils/request'

/**
 * 菜单管理接口
 */

/**
 * 获取当前用户的前端路由配置（动态路由用）
 * @returns {Promise<Array<{path, element, exact, protectedRoute, children}>>}
 */
export function getRoutes() {
  return request.get('/sys/menu/routes')
}

/**
 * 获取当前用户有权限的菜单列表（树形，含 perms 用于权限收集）
 */
export function getMenuList() {
  return request.get('/sys/menu/list')
}

/**
 * 获取系统所有菜单列表（菜单管理页面使用）
 */
export function getMenuListAll() {
  return request.get('/sys/menu/listAll')
}

/**
 * 新增菜单/按钮
 * @param {{parentId, name, url, reactComponent, perms, type, icon, orderNum}} data
 */
export function addMenu(data) {
  return request.post('/sys/menu/add', data)
}

/**
 * 修改菜单
 * @param {{menuId, parentId, name, url, reactComponent, perms, type, icon, orderNum}} data
 */
export function updateMenu(data) {
  return request.post('/sys/menu/update', data)
}

/**
 * 删除菜单（路径参数）
 * @param {number} menuId 菜单ID
 */
export function deleteMenu(menuId) {
  return request.post(`/sys/menu/delete/${menuId}`)
}
