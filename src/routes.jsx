import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Button, Result, Spin } from 'antd'
import { useUserStore } from './store/userStore'

/**
 * 组件注册表
 * 将后端返回的 element / reactComponent 字符串映射到懒加载组件
 * 未注册的组件名将降级为 404 提示页
 */
export const componentRegistry = {
  Dashboard: lazy(() => import('./pages/Dashboard/index.jsx')),
  UserList: lazy(() => import('./pages/User/UserList.jsx')),
  RoleList: lazy(() => import('./pages/Role/RoleList.jsx')),
  MenuList: lazy(() => import('./pages/Menu/MenuList.jsx')),
  DictList: lazy(() => import('./pages/Dict/DictList.jsx')),
  FileList: lazy(() => import('./pages/File/FileList.jsx')),
  Profile: lazy(() => import('./pages/Profile/index.jsx')),
}

/**
 * 页面级加载占位（懒加载过渡）
 */
export function PageLoading({ tip = '页面加载中...' }) {
  return (
    <div className="page-loading">
      <Spin size="large" tip={tip}>
        <div className="page-loading-holder" />
      </Spin>
    </div>
  )
}

/**
 * 404 页面（访问不存在或无权限的路由）
 */
export function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在或暂无访问权限"
      extra={
        <Button type="primary" onClick={() => (window.location.href = '/dashboard')}>
          返回首页
        </Button>
      }
    />
  )
}

/**
 * 递归将后端路由树转换为 React Router 路由对象
 * 注意：路由仅负责"匹配"（实现页面级权限隔离），
 * 实际页面渲染交由 KeepAlive 容器完成（以支持多标签缓存）
 * @param {Array} routeTree 后端路由树
 * @returns {Array} React Router 路由对象数组
 */
export function buildRoutes(routeTree) {
  if (!Array.isArray(routeTree)) return []
  const build = (node) => {
    const route = { path: node.path }
    if (node.children && node.children.length) {
      route.children = node.children.map(build)
    }
    return route
  }
  return routeTree.map(build)
}

/**
 * 构建 path -> 组件名 映射（供 KeepAlive 渲染使用）
 * 首页 /dashboard、个人中心 /profile 固定映射，不依赖后端菜单路由树
 * 后端路由树中子节点使用相对路径（如 "user"），需拼接父路径得到绝对路径（如 "/sys/user"）
 * @param {Array} routeTree 后端路由树
 * @returns {Object<string, string>}
 */
export function buildPathComponentMap(routeTree) {
  // /dashboard、/profile 为静态注册页面，不依赖后端菜单路由树
  const map = { '/dashboard': 'Dashboard', '/profile': 'Profile' }
  const traverse = (nodes, parentPath) => {
    if (!Array.isArray(nodes)) return
    nodes.forEach((node) => {
      const fullPath = node.path.startsWith('/')
        ? node.path
        : `${parentPath}/${node.path}`.replace(/\/+/g, '/')
      if (node.element) map[fullPath] = node.element
      if (node.children && node.children.length) {
        traverse(node.children, fullPath)
      }
    })
  }
  traverse(routeTree || [], '')
  return map
}

/**
 * 全屏加载态：刷新页面（有 Token 但路由未加载）时重新拉取资源
 * init 的并发去重在 userStore 内部完成；
 * 加载失败（网络异常 / 无权限 / 服务端错误）时清空登录态，
 * AuthGuard 检测到 token 为空后自动重定向到登录页
 */
function RouteLoading() {
  const init = useUserStore((s) => s.init)
  const clearAuth = useUserStore((s) => s.clearAuth)

  useEffect(() => {
    init().catch((e) => {
      console.error('[routes] init error:', e)
      clearAuth()
    })
  }, [init, clearAuth])

  return (
    <div className="route-loading">
      <Spin size="large" />
      <p className="route-loading-text">正在加载系统资源...</p>
    </div>
  )
}

/**
 * 路由守卫
 * - 无 Token → 重定向登录页（记录来源位置，登录后回跳）
 * - 有 Token 但路由未加载 → 全屏加载并重新拉取
 * - 正常 → 渲染子路由（Outlet）
 */
export function AuthGuard() {
  const token = useUserStore((s) => s.token)
  const routesLoaded = useUserStore((s) => s.routesLoaded)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  if (!routesLoaded) {
    return <RouteLoading />
  }
  return <Outlet />
}
