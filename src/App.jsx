import { useMemo } from 'react'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter, Navigate, useRoutes } from 'react-router-dom'
import Login from './pages/Login/index.jsx'
import Layout from './components/Layout/index.jsx'
import { AuthGuard, buildRoutes } from './routes.jsx'
import { useTheme } from './hooks/useTheme'
import { useUserStore } from './store/userStore'

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
          {
            element: <Layout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              { path: '/dashboard', element: null },
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

function App() {
  const { antdThemeConfig } = useTheme()

  return (
    <ConfigProvider locale={zhCN} theme={antdThemeConfig}>
      <AntApp>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  )
}

export default App
