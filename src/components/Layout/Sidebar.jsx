import { useMemo } from 'react'
import { Layout as AntLayout, Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { useUserStore } from '../../store/userStore'
import { useTabStore } from '../../store/tabStore'
import { MENU_ICONS } from '../IconSelect/iconMap'
import { traverseTree } from '../../utils/helpers'
import logoImg from '../../assets/logo.png'

// 菜单 url 归一化为路由 path（补前导 /）
function normalize(url) {
  if (!url) return ''
  return url.startsWith('/') ? url : `/${url}`
}

// 递归构建 AntD Menu items（过滤按钮类型 type=2）
function buildMenuItems(nodes) {
  if (!nodes) return []
  return nodes
    .filter((n) => n.type !== 2)
    .map((node) => {
      const key = normalize(node.url)
      const IconComp = MENU_ICONS[node.icon]
      const icon = IconComp ? <IconComp /> : null
      const visibleChildren = (node.children || []).filter((c) => c.type !== 2)
      if (node.type === 0 && visibleChildren.length) {
        return {
          key,
          icon,
          label: node.name,
          children: buildMenuItems(visibleChildren),
        }
      }
      return { key, icon, label: node.name }
    })
}

/**
 * 左侧菜单栏：Logo 区 + 递归动态菜单
 */
function Sidebar() {
  const collapsed = useAppStore((s) => s.collapsed)
  const menus = useUserStore((s) => s.menus)
  const activeKey = useTabStore((s) => s.activeKey)
  const navigate = useNavigate()

  const items = useMemo(() => buildMenuItems(menus), [menus])

  // 默认展开所有目录节点
  const defaultOpenKeys = useMemo(() => {
    const keys = []
    traverseTree(menus, (node) => {
      if (node.type === 0) keys.push(normalize(node.url))
    })
    return keys
  }, [menus])

  return (
    <AntLayout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      collapsedWidth={64}
      className="app-sider"
    >
      <div className="sider-logo" title="ReactAdmin 管理系统">
        <img className="sider-logo-mark" src={logoImg} alt="ReactAdmin Logo" />
        {!collapsed && <span className="sider-logo-text">ReactAdmin</span>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[activeKey]}
        defaultOpenKeys={defaultOpenKeys}
        items={items}
        onClick={({ key }) => navigate(key)}
        className="sider-menu"
      />
    </AntLayout.Sider>
  )
}

export default Sidebar
