import { useNavigate } from 'react-router-dom'
import { Card } from 'antd'
import { PictureOutlined, RightOutlined } from '@ant-design/icons'
import './sysconfig.css'

/**
 * 系统配置入口页（/sys/config）
 * 以卡片入口形式聚合各配置项，当前包含：登录页配置
 */
const ENTRIES = [
  {
    key: 'loginPage',
    icon: <PictureOutlined />,
    title: '登录页配置',
    desc: '配置登录页轮播图片、轮播开关与切换间隔',
    path: '/sys/config/loginPage',
  },
]

function SysConfig() {
  const navigate = useNavigate()

  return (
    <Card
      className="table-card"
      title={
        <span className="table-card-head">
          <span className="table-card-title">系统配置</span>
          <span className="table-card-desc">系统级个性化配置入口</span>
        </span>
      }
    >
      <div className="sysconfig-entries">
        {ENTRIES.map((entry) => (
          <div
            key={entry.key}
            className="sysconfig-entry"
            onClick={() => navigate(entry.path)}
          >
            <span className="sysconfig-entry-icon">{entry.icon}</span>
            <span className="sysconfig-entry-body">
              <span className="sysconfig-entry-title">{entry.title}</span>
              <span className="sysconfig-entry-desc">{entry.desc}</span>
            </span>
            <RightOutlined className="sysconfig-entry-arrow" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export default SysConfig
