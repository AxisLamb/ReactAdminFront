import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Form, Input, Button, Checkbox, Alert, App } from 'antd'
import { UserOutlined, LockOutlined, SafetyCertificateOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons'
import { useUserStore } from '../../store/userStore'
import { getStorage, setStorage, removeStorage } from '../../utils/storage'
import logoImg from '../../assets/logo.png'
import brandImg from '../../assets/login-brand.png'
import './login.css'

const REMEMBER_KEY = 'remembered_username'

/** 左侧品牌面板能力亮点 */
const FEATURES = [
  {
    icon: <SafetyCertificateOutlined />,
    title: '权限管控',
    desc: 'RBAC 角色模型，菜单与按钮级精细化授权',
  },
  {
    icon: <TeamOutlined />,
    title: '高效协同',
    desc: '多标签页浏览与页面缓存，操作流畅不中断',
  },
  {
    icon: <BarChartOutlined />,
    title: '数据洞察',
    desc: '实时数据概览，系统运行状态一目了然',
  },
]

/**
 * 登录页
 * 左侧品牌面板（多层渐变 + 能力亮点 + 品牌插画），右侧登录表单
 */
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()
  const login = useUserStore((s) => s.login)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const remembered = getStorage(REMEMBER_KEY, '')

  const handleFinish = async (values) => {
    setLoading(true)
    setErrorMsg('')
    try {
      await login({ username: values.username, password: values.password })
      // 记住登录：保存用户名，否则清除
      if (values.remember) {
        setStorage(REMEMBER_KEY, values.username)
      } else {
        removeStorage(REMEMBER_KEY)
      }
      message.success('登录成功，欢迎回来')
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    } catch (e) {
      setErrorMsg(e?.message || '登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* 左侧品牌面板 */}
      <div className="login-brand">
        {/* 流动几何装饰 */}
        <span className="brand-shape brand-shape-ring" />
        <span className="brand-shape brand-shape-square" />
        <span className="brand-shape brand-shape-dot" />

        <div className="brand-header">
          <img className="brand-logo" src={logoImg} alt="ReactAdmin Logo" />
          <div className="brand-name">
            <strong>ReactAdmin</strong>
            <span>企业级管理系统</span>
          </div>
        </div>

        <div className="brand-body">
          <h1 className="brand-slogan">
            一站式后台管理
            <br />
            让团队协作更高效
          </h1>
          <ul className="brand-features">
            {FEATURES.map((f) => (
              <li key={f.title} className="brand-feature">
                <span className="feature-icon">{f.icon}</span>
                <div className="feature-text">
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="brand-visual">
          <img src={brandImg} alt="品牌插画" draggable={false} />
        </div>
      </div>

      {/* 右侧登录区 */}
      <div className="login-panel">
        <div className="login-box">
          <div className="login-heading">
            <h2>欢迎登录</h2>
            <p>请输入您的账号信息，开启高效管理之旅</p>
          </div>

          <Alert
            className="login-alert"
            message={errorMsg}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMsg('')}
          />

          <Form
            name="login"
            size="large"
            initialValues={{ username: remembered, remember: !!remembered }}
            onFinish={handleFinish}
            autoComplete="off"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="login-input-icon" />}
                placeholder="用户名"
                allowClear
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="login-input-icon" />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住登录</Checkbox>
              </Form.Item>
              <span className="login-hint">默认账号 admin</span>
            </Form.Item>

            <Form.Item>
              <Button
                className="login-submit"
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                {loading ? '登录中...' : '登 录'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="login-copyright">
          Copyright © 2026 ReactAdmin · Powered by React 19 & Ant Design 5
        </div>
      </div>
    </div>
  )
}
