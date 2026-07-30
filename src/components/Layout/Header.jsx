import { useMemo, useState, useEffect } from 'react'
import {
  Layout as AntLayout,
  Breadcrumb,
  Dropdown,
  Avatar,
  Space,
  Button,
  Modal,
  message,
} from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  BgColorsOutlined,
  CheckOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/appStore'
import { useUserStore } from '../../store/userStore'
import { useTabStore } from '../../store/tabStore'
import { useTheme, THEME_LIST } from '../../hooks/useTheme'
import { getStorage, STORAGE_KEYS } from '../../utils/storage'

function normalize(url) {
  if (!url) return ''
  return url.startsWith('/') ? url : `/${url}`
}

// 在菜单树中 DFS 查找目标路径的完整链路（用于面包屑）
function findChain(nodes, targetPath, trail = []) {
  for (const node of nodes) {
    const path = normalize(node.url)
    const nextTrail = [...trail, node]
    if (path === targetPath) return nextTrail
    if (node.children && node.children.length) {
      const found = findChain(node.children, targetPath, nextTrail)
      if (found) return found
    }
  }
  return null
}

/**
 * 顶部导航栏：折叠按钮 / 面包屑 / 全屏 / 主题切换 / 用户下拉
 */
function Header() {
  const navigate = useNavigate()
  const collapsed = useAppStore((s) => s.collapsed)
  const toggleCollapsed = useAppStore((s) => s.toggleCollapsed)
  const menus = useUserStore((s) => s.menus)
  const userInfo = useUserStore((s) => s.userInfo)
  const logout = useUserStore((s) => s.logout)
  const activeKey = useTabStore((s) => s.activeKey)
  const { theme, setTheme } = useTheme()

  // ---- 面包屑 ----
  const breadcrumbItems = useMemo(() => {
    if (activeKey === '/dashboard') return [{ title: '首页' }]
    const chain = findChain(menus, activeKey)
    if (chain && chain.length) return chain.map((n) => ({ title: n.name }))
    return [{ title: activeKey }]
  }, [activeKey, menus])

  // ---- 全屏 ----
  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])
  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  // ---- 主题切换 ----
  const themeMenuItems = THEME_LIST.map((t) => ({
    key: t.key,
    label: (
      <Space size={8}>
        <span className="theme-dot" style={{ background: t.color }} />
        <span>{t.label}</span>
        {theme === t.key && <CheckOutlined style={{ fontSize: 12 }} />}
      </Space>
    ),
  }))
  const onThemeClick = ({ key }) => {
    setTheme(key)
    const label = THEME_LIST.find((t) => t.key === key)?.label || key
    message.success(`已切换到${label}主题`)
  }

  // ---- 用户下拉 ----
  const avatar = getStorage(STORAGE_KEYS.AVATAR, '')
  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
  ]
  const onUserMenuClick = ({ key }) => {
    if (key === 'profile') {
      navigate('/profile')
    } else if (key === 'logout') {
      Modal.confirm({
        title: '确认退出',
        content: '确定要退出登录吗？',
        okText: '退出',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: () =>
          logout().then(() => {
            message.success('已退出登录')
            navigate('/login', { replace: true })
          }),
      })
    }
  }

  return (
    <AntLayout.Header className="app-header">
      <div className="header-left">
        <Button
          type="text"
          className="header-action collapse-btn"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => toggleCollapsed()}
          title={collapsed ? '展开菜单' : '收起菜单'}
        />
        <Breadcrumb items={breadcrumbItems} className="header-breadcrumb" />
      </div>

      <Space className="header-right" size={4}>
        <Button
          type="text"
          className="header-action"
          icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
          title={isFullscreen ? '退出全屏' : '全屏'}
        />
        <Dropdown
          menu={{ items: themeMenuItems, onClick: onThemeClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            className="header-action"
            icon={<BgColorsOutlined />}
            title="切换主题"
          />
        </Dropdown>
        <Dropdown
          menu={{ items: userMenuItems, onClick: onUserMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space className="user-trigger" size={8}>
            <Avatar
              size={30}
              src={avatar || undefined}
              icon={<UserOutlined />}
              className="user-avatar"
            />
            <span className="user-name">
              {userInfo?.realName || userInfo?.userName || '未登录'}
            </span>
            <DownOutlined className="user-caret" />
          </Space>
        </Dropdown>
      </Space>
    </AntLayout.Header>
  )
}

export default Header
