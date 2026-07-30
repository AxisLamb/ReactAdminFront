import { useEffect, useMemo } from 'react'
import { Layout as AntLayout, Watermark } from 'antd'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Tabs from './Tabs'
import KeepAlive from '../KeepAlive'
import { useUserStore } from '../../store/userStore'
import { useTabStore } from '../../store/tabStore'
import { useDictStore } from '../../store/dictStore'
import { traverseTree } from '../../utils/helpers'
import './layout.css'

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
    const menu = pathMenuMap[path]
    addTab({
      key: path,
      title: path === '/dashboard' ? '首页' : menu?.name || path,
      closable: path !== '/dashboard',
    })
  }, [location.pathname, pathMenuMap, addTab])

  // 应用启动预加载常用字典
  useEffect(() => {
    loadDict('sys_user_status')
  }, [loadDict])

  const watermarkContent = userInfo?.realName || userInfo?.userName || ''

  return (
    <AntLayout className="app-layout">
      <Sidebar />
      <AntLayout className="app-main">
        <Header />
        <Tabs />
        <Content className="app-content">
          <Watermark content={watermarkContent}>
            <KeepAlive />
          </Watermark>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
