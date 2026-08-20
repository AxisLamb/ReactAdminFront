import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Col, Row, Skeleton, Tag } from 'antd'
import {
  TeamOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  BookOutlined,
  CloudUploadOutlined,
  UserOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { getDashboardStatistics } from '@/api/dashboard'
import { useUserStore } from '@/store/userStore'
import { useAppStore } from '@/store/appStore'
import { usePermission } from '@/hooks/usePermission'
import { THEME_LIST } from '@/hooks/useTheme'
import { getGreeting, formatDate, traverseTree } from '@/utils/helpers'
import brandImg from '@/assets/login-brand.png'
import '@/pages/sys/Dashboard/dashboard.css'

/**
 * 数字滚动动画 Hook（easeOutCubic）
 * @param {number} target 目标数值
 * @param {number} duration 动画时长 ms
 */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        fromRef.current = target
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

/** 统计卡片元信息 */
const STAT_META = [
  { key: 'user', title: '用户总数', icon: <TeamOutlined />, color: '#1890FF', target: '用户管理' },
  { key: 'role', title: '角色总数', icon: <SafetyCertificateOutlined />, color: '#52C41A', target: '角色管理' },
  { key: 'menu', title: '菜单总数', icon: <MenuOutlined />, color: '#FAAD14', target: '菜单管理' },
  { key: 'dict', title: '字典总数', icon: <BookOutlined />, color: '#722ED1', target: '字典管理' },
]

/** 快捷入口元信息 */
const QUICK_META = [
  { name: '用户管理', icon: <TeamOutlined />, color: '#1890FF', fallback: '/user' },
  { name: '角色管理', icon: <SafetyCertificateOutlined />, color: '#52C41A', fallback: '/role' },
  { name: '菜单管理', icon: <MenuOutlined />, color: '#FAAD14', fallback: '/menu' },
  { name: '字典管理', icon: <BookOutlined />, color: '#722ED1', fallback: '/sys/dict' },
  { name: '文件管理', icon: <CloudUploadOutlined />, color: '#13C2C2', fallback: '/file' },
  { name: '个人中心', icon: <UserOutlined />, color: '#EB2F96', fallback: '/profile' },
]

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

/**
 * 仪表盘首页
 * 欢迎横幅 + 数据概览（数字滚动）+ 快捷入口 + 系统信息
 */
export default function Dashboard() {
  const navigate = useNavigate()
  const userInfo = useUserStore((s) => s.userInfo)
  const menus = useUserStore((s) => s.menus)
  const theme = useAppStore((s) => s.theme)
  const { hasPermission } = usePermission()

  // 无 sys:dashboard:list 权限时不请求、不展示统计数据
  const canViewStats = hasPermission('sys:dashboard:list')

  const [stats, setStats] = useState({ user: 0, role: 0, menu: 0, dict: 0 })
  const [loading, setLoading] = useState(true)

  // 调用统计接口拉取各模块总数
  useEffect(() => {
    if (!canViewStats) {
      setLoading(false)
      return undefined
    }
    let mounted = true
    getDashboardStatistics()
      .then((data) => {
        if (!mounted) return
        setStats({
          user: data?.userCount || 0,
          role: data?.roleCount || 0,
          menu: data?.menuCount || 0,
          dict: data?.dictCount || 0,
        })
      })
      .catch((e) => {
        console.error('[dashboard] statistics error:', e)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [canViewStats])

  /** 按菜单名称从菜单树解析真实路径（后端 url 无前导 /） */
  const resolvePath = (name, fallback) => {
    let path = fallback
    traverseTree(menus, (node) => {
      if (node.name === name && node.url) path = `/${node.url}`
    })
    return path
  }

  const now = new Date()
  const dateText = `${formatDate(now, 'YYYY年MM月DD日')} ${WEEKDAYS[now.getDay()]}`
  const themeLabel = THEME_LIST.find((t) => t.key === theme)?.label || '亮色'
  const userName = userInfo?.realName || userInfo?.username || '管理员'

  const systemInfo = [
    { label: '系统版本', value: 'v1.0.0' },
    { label: '前端框架', value: 'React 19 + Ant Design 5' },
    { label: '状态管理', value: 'Zustand' },
    { label: '构建工具', value: 'Vite 7' },
    { label: '当前主题', value: themeLabel },
  ]

  return (
    <div className="dashboard-page">
      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2 className="welcome-title">
            {getGreeting()}，{userName}
            {userInfo?.role?.roleName && (
              <Tag className="welcome-role" color="blue">
                {userInfo.role.roleName}
              </Tag>
            )}
          </h2>
          <p className="welcome-sub">
            今天是 {dateText}，祝您工作愉快！
          </p>
        </div>
        <img className="welcome-visual" src={brandImg} alt="" draggable={false} />
        <span className="welcome-glow" />
      </div>

      {/* 数据概览：无 sys:dashboard:list 权限时不展示 */}
      {canViewStats && (
        <Row gutter={[16, 16]} className="stat-row">
          {STAT_META.map((meta, idx) => (
            <Col xs={24} sm={12} xl={6} key={meta.key}>
              <StatCard
                meta={meta}
                value={stats[meta.key]}
                loading={loading}
                delay={idx * 0.08}
                onClick={() => navigate(resolvePath(meta.target, `/${meta.key}`))}
              />
            </Col>
          ))}
        </Row>
      )}

      <Row gutter={[16, 16]}>
        {/* 快捷入口 */}
        <Col xs={24} xl={16}>
          <Card
            className="dash-card quick-card"
            title="常用功能"
            styles={{ body: { padding: '16px 20px 20px' } }}
          >
            <div className="quick-grid">
              {QUICK_META.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className="quick-item"
                  onClick={() => navigate(resolvePath(item.name, item.fallback))}
                >
                  <span
                    className="quick-icon"
                    style={{ color: item.color, background: `${item.color}1f` }}
                  >
                    {item.icon}
                  </span>
                  <span className="quick-name">{item.name}</span>
                  <RightOutlined className="quick-arrow" />
                </button>
              ))}
            </div>
          </Card>
        </Col>

        {/* 系统信息 */}
        <Col xs={24} xl={8}>
          <Card
            className="dash-card info-card"
            title="系统信息"
            styles={{ body: { padding: '8px 20px 12px' } }}
          >
            <ul className="info-list">
              {systemInfo.map((item) => (
                <li key={item.label} className="info-item">
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value}</span>
                </li>
              ))}
              <li className="info-item">
                <span className="info-label">服务器状态</span>
                <span className="info-value">
                  <span className="status-dot" />
                  运行正常
                </span>
              </li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

/**
 * 统计卡片（数字滚动 + hover 上浮）
 */
function StatCard({ meta, value, loading, delay, onClick }) {
  const animated = useCountUp(value)

  return (
    <div
      className="stat-card"
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      <span className="stat-icon" style={{ color: meta.color, background: `${meta.color}1f` }}>
        {meta.icon}
      </span>
      <div className="stat-body">
        <span className="stat-title">{meta.title}</span>
        {loading ? (
          <Skeleton.Input active size="small" className="stat-skeleton" />
        ) : (
          <span className="stat-value" style={{ color: meta.color }}>
            {animated}
          </span>
        )}
      </div>
      <span className="stat-corner" style={{ background: `${meta.color}14` }} />
    </div>
  )
}
