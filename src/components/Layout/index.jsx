import { useEffect, useMemo } from 'react'
import { Layout as AntLayout, Watermark } from 'antd'
import { useLocation } from 'react-router-dom'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import Tabs from '@/components/Layout/Tabs'
import KeepAlive from '@/components/KeepAlive'
import { useUserStore } from '@/store/userStore'
import { useTabStore } from '@/store/tabStore'
import { useDictStore } from '@/store/dictStore'
import { useAppStore } from '@/store/appStore'
import { traverseTree } from '@/utils/helpers'
import '@/components/Layout/layout.css'

const { Content } = AntLayout

/**
 * 应用主布局：Sider + Header + Tabs + KeepAlive 内容区 + 水印
 */
function Layout() {
  const location = useLocation()
  const menus = useUserStore((s) => s.menus)
  const userInfo = useUserStore((s) => s.userInfo)
  const addTab = useTabStore((s) => s.addTab)
  const loadDict = useDictStore((s) => s.loadDict)

  // path -> 菜单节点映射（用于标签标题）
  const pathMenuMap = useMemo(() => {
    const map = {}
    traverseTree(menus, (node) => {
      if (node.url) {
        const path = node.url.startsWith('/') ? node.url : `/${node.url}`
        map[path] = node
      }
    })
    return map
  }, [menus])

  // 路由变化时同步标签页
  useEffect(() => {
    const path = location.pathname
    // 根路径由路由层重定向到 /dashboard，不生成标签
    if (path === '/') return
    const menu = pathMenuMap[path]
    // 静态注册页面不在菜单树中，标题走兜底映射
    const STATIC_TITLES = {
      '/dashboard': '首页',
      '/profile': '个人中心',
      '/sys/config/loginPage': '登录页配置',
    }
    const staticTitle = STATIC_TITLES[path] || ''
    addTab({
      key: path,
      title: staticTitle || menu?.name || path,
      closable: path !== '/dashboard',
    })
  }, [location.pathname, pathMenuMap, addTab])

  // 应用启动预加载常用字典
  useEffect(() => {
    loadDict('sys_user_status')
  }, [loadDict])

  const watermarkEnabled = useAppStore((s) => s.watermarkEnabled)
  const watermarkContent = userInfo?.realName || userInfo?.userName || ''

  const content = <KeepAlive />

  return (
    <AntLayout className="app-layout">
      <Sidebar />
      <AntLayout className="app-main">
        <Header />
        <Tabs />
        <Content className="app-content">
          {watermarkEnabled ? (
            <Watermark content={watermarkContent}>{content}</Watermark>
          ) : (
            content
          )}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
