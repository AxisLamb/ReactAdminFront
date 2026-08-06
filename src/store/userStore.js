import { create } from 'zustand'
import { login as loginApi, logout as logoutApi } from '../api/auth'
import { getUserInfo } from '../api/user'
import { getRoutes, getMenuList } from '../api/menu'
import { collectPermissions, listToTree } from '../utils/helpers'
import {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  STORAGE_KEYS,
} from '../utils/storage'
import { useTabStore } from './tabStore'

// init 并发去重：进行中的初始化 Promise（StrictMode 双挂载 / 多组件共用）
let initPromise = null

/**
 * 用户状态管理
 * 负责登录态、用户信息、动态菜单/路由、按钮权限集合
 */
export const useUserStore = create((set, get) => ({
  // Token，初始从本地存储恢复（刷新场景）
  token: getStorage(STORAGE_KEYS.TOKEN, ''),
  // 当前用户详情（含 role 对象）
  userInfo: getStorage(STORAGE_KEYS.USER_INFO, null),
  // 菜单树（侧边栏渲染 + 权限收集）
  menus: [],
  // 前端路由树（动态路由生成）
  routes: [],
  // 按钮级权限标识集合，如 ['sys:user:save', 'sys:user:delete']
  permissions: getStorage(STORAGE_KEYS.PERMISSIONS, []),
  // 路由是否已加载完成（刷新后需重新拉取）
  routesLoaded: false,

  /**
   * 登录
   * @param {{username: string, password: string}} payload
   * @returns {Promise<object>} 用户信息
   */
    login: async (payload) => {
      const data = await loginApi(payload)
      // 后端 data 直接为 token 字符串；同时兼容 { token, userInfo } 对象格式
      const token = typeof data === 'string' ? data : data?.token || ''
      const userInfo = typeof data === 'string' ? null : data?.userInfo || null
      setStorage(STORAGE_KEYS.TOKEN, token)
      if (userInfo) setStorage(STORAGE_KEYS.USER_INFO, userInfo)
      set({ token, userInfo })
      // 菜单/权限初始化统一交由 AuthGuard 的 RouteLoading 完成，避免重复拉取
      return userInfo
  },

  /**
   * 初始化：并行拉取路由树、菜单树、用户详情
   * 用于登录成功后及刷新页面（有 Token 但路由未加载）场景
   * 内置并发去重：进行中的 init 复用同一 Promise，失败后允许重试
   */
  init: () => {
    if (initPromise) return initPromise
    const promise = (async () => {
      const [routes, menus, userInfo] = await Promise.all([
        getRoutes(),
        getMenuList(),
        getUserInfo(),
      ])
      // 后端返回扁平菜单列表（含 parentId），转为树形结构供侧边栏使用
      const menuTree = Array.isArray(menus) && menus.length && !menus[0].children
        ? listToTree(menus)
        : menus || []
      const permissions = collectPermissions(menuTree)
      setStorage(STORAGE_KEYS.PERMISSIONS, permissions)
      if (userInfo) setStorage(STORAGE_KEYS.USER_INFO, userInfo)
      set({
        routes: routes || [],
        menus: menuTree,
        userInfo: userInfo || get().userInfo,
        permissions,
        routesLoaded: true,
      })
      return { routes: routes || [], menus: menuTree }
    })()
    initPromise = promise
    promise.finally(() => {
      if (initPromise === promise) initPromise = null
    })
    return promise
  },

  /**
   * 清空登录态（zustand + localStorage + 标签页缓存）
   * 401 认证失效、路由初始化失败、主动退出时统一调用；
   * 清空后 AuthGuard 检测到 token 为空会自动重定向到登录页
   */
  clearAuth: () => {
    initPromise = null
    // 清空业务存储（保留主题等偏好设置）
    removeStorage(STORAGE_KEYS.TOKEN)
    removeStorage(STORAGE_KEYS.USER_INFO)
    removeStorage(STORAGE_KEYS.PERMISSIONS)
    useTabStore.getState().removeAllTabs()
    set({
      token: '',
      userInfo: null,
      menus: [],
      routes: [],
      permissions: [],
      routesLoaded: false,
    })
  },

  /**
   * 退出登录
   * @param {boolean} callApi 是否调用后端登出接口（401 场景下传 false）
   * @returns {Promise<boolean>} 后端登出接口是否调用成功。
   *   返回 false 时（如 token 已过期，后端返回 401），401 事件机制已提示
   *   "登录已过期"，调用方不应再重复提示"退出登录成功"
   */
  logout: async (callApi = true) => {
    let apiOk = true
    if (callApi) {
      try {
        await logoutApi()
      } catch (e) {
        apiOk = false
        console.error('[userStore] logout api error:', e)
      }
    }
    get().clearAuth()
    return apiOk
  },

  /**
   * 更新用户信息（个人中心修改资料后同步）
   * @param {object} userInfo
   */
  setUserInfo: (userInfo) => {
    setStorage(STORAGE_KEYS.USER_INFO, userInfo)
    set({ userInfo })
  },

  /**
   * 判断是否拥有指定权限
   * @param {string|string[]} perms 单个或数组，数组为"任一满足"
   * @returns {boolean}
   */
  hasPermission: (perms) => {
    const { permissions } = get()
    if (!perms) return true
    const list = Array.isArray(perms) ? perms : [perms]
    return list.some((p) => permissions.includes(p))
  },
}))

export { clearStorage }
