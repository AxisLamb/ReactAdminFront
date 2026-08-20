import { useEffect, useMemo } from 'react'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter, Navigate, useRoutes } from 'react-router-dom'
import Login from '@/pages/Login/index.jsx'
import Layout from '@/components/Layout/index.jsx'
import { AuthGuard, buildRoutes } from '@/routes.jsx'
import { useTheme } from '@/hooks/useTheme'
import { useUserStore } from '@/store/userStore'

/**
 * 数据路由组装
 * - /login：登录页
 * - /：AuthGuard 守卫 → Layout 布局 → 动态子路由（含首页重定向与 404 兜底）
 * 动态路由仅负责匹配（页面级权限隔离），页面渲染由 KeepAlive 完成
 */
function AppRoutes() {
  const routes = useUserStore((s) => s.routes)
  const routesLoaded = useUserStore((s) => s.routesLoaded)

  const routeObjects = useMemo(() => {
    const dynamic = routesLoaded ? buildRoutes(routes) : []
    return [
      { path: '/login', element: <Login /> },
      {
        path: '/',
        element: <AuthGuard />,
        children: [
          // 根路径重定向到首页：必须放在 Layout 之外（Layout 不渲染 Outlet，
          // 放在其子路由中会导致 Navigate 永远不执行）
          { index: true, element: <Navigate to="/dashboard" replace /> },
          {
            element: <Layout />,
            children: [
              { path: '/dashboard', element: null },
              // 个人中心为登录用户通用页面，不依赖后端菜单路由，静态注册
              { path: '/profile', element: null },
              // 系统配置：/sys/config 由后端菜单下发，loginPage 子页为前端静态入口
              { path: '/sys/config', element: null },
              { path: '/sys/config/loginPage', element: null },
              ...dynamic,
              { path: '*', element: null },
            ],
          },
        ],
      },
    ]
  }, [routes, routesLoaded])

  return useRoutes(routeObjects)
}

/**
 * 认证失效监听器
 * 请求层检测到 401 时派发 auth:unauthorized 事件（见 utils/request.js），
 * 此处统一提示并清空登录态；clearAuth 使 token 置空后，
 * AuthGuard 自动 <Navigate to="/login"> 完成 SPA 跳转，无需整页刷新
 */
function AuthEventListener() {
  const { message: msg } = AntApp.useApp()

  useEffect(() => {
    const onUnauthorized = () => {
      msg.warning({ content: '登录已过期，请重新登录', key: 'auth-unauthorized' })
      useUserStore.getState().clearAuth()
    }
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [msg])

  return null
}

function App() {
  const { antdThemeConfig } = useTheme()

  return (
    <ConfigProvider locale={zhCN} theme={antdThemeConfig}>
      <AntApp>
        <BrowserRouter>
          <AuthEventListener />
          <AppRoutes />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
