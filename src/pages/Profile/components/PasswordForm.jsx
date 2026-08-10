import { useState } from 'react'
import { App, Button, Form, Input, Progress } from 'antd'
import { SafetyOutlined } from '@ant-design/icons'
import { updateUser } from '../../../api/user'
import { useUserStore } from '../../../store/userStore'

/** 计算密码强度（0-3）：长度 ≥8 / 字母+数字混合 / 含符号或长度 ≥12 */
const getStrength = (pwd = '') => {
  if (!pwd) return null
  let score = 0
  if (pwd.length >= 8) score += 1
  if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score += 1
  if (/[^a-zA-Z0-9]/.test(pwd) || pwd.length >= 12) score += 1
  const meta = [
    null,
    { label: '弱', percent: 33, status: 'exception' },
    { label: '中', percent: 66, status: 'normal' },
    { label: '强', percent: 100, status: 'success' },
  ][score]
  return meta ? { label: meta.label, percent: meta.percent, status: meta.status } : null
}

/**
 * 修改密码表单
 * 说明：复用 /sys/user/update 提交新密码（后端已支持，实测生效）。
 * 注意：载荷必须携带 roleId，否则后端更新时会将用户角色置空；
 * 当前密码仅作前端二次确认留存，不随请求发送。
 */
const PasswordForm = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const userInfo = useUserStore((s) => s.userInfo)
  const [saving, setSaving] = useState(false)
  const pwdValue = Form.useWatch('password', form)
  const strength = getStrength(pwdValue)

  const handleSubmit = (values) => {
    if (!userInfo) return
    setSaving(true)
    updateUser({
      userId: userInfo.userId,
      // 实测 update 未携带 roleId 时后端会将角色置空，需一并提交
      roleId: userInfo.roleId ?? userInfo.role?.roleId,
      password: values.password,
    })
      .then(() => {
        message.success('密码修改成功')
        form.resetFields()
      })
      .catch((e) => console.error('[PasswordForm] submit error:', e))
      .finally(() => setSaving(false))
  }

  return (
    <Form
      form={form}
      className="modal-form profile-form"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
      onFinish={handleSubmit}
      autoComplete="off"
    >
      <Form.Item
        label="当前密码"
        name="oldPassword"
        rules={[{ required: true, message: '请输入当前密码' }]}
      >
        <Input.Password placeholder="请输入当前密码" autoComplete="current-password" />
      </Form.Item>

      <Form.Item
        label="新密码"
        name="password"
        rules={[
          { required: true, whitespace: true, message: '请输入新密码' },
          { min: 5, message: '密码至少 5 个字符' },
        ]}
      >
        <Input.Password placeholder="请输入新密码" autoComplete="new-password" />
      </Form.Item>

      {strength && (
        <Form.Item wrapperCol={{ offset: 4, span: 18 }} className="pwd-strength-item">
          <div className="pwd-strength">
            <Progress
              percent={strength.percent}
              status={strength.status}
              size="small"
              showInfo={false}
            />
            <span className="pwd-strength-label">密码强度：{strength.label}</span>
          </div>
        </Form.Item>
      )}

      <Form.Item
        label="确认密码"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: '请再次输入新密码' },
          {
            validator: (_, value) =>
              !value || value === form.getFieldValue('password')
                ? Promise.resolve()
                : Promise.reject(new Error('两次输入的密码不一致')),
          },
        ]}
      >
        <Input.Password placeholder="请再次输入新密码" autoComplete="new-password" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
        <Button type="primary" htmlType="submit" icon={<SafetyOutlined />} loading={saving}>
          确认修改
        </Button>
      </Form.Item>
    </Form>
  )
}

export default PasswordForm
