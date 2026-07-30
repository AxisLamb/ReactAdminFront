import { useEffect, useState } from 'react'
import { App, Button, Form, Input } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import { updateUser } from '../../../api/user'
import { useUserStore } from '../../../store/userStore'

const EMAIL_REG = /^[\w.%+-]+@[\w-]+(\.[\w-]+)+$/
const MOBILE_REG = /^1[3-9]\d{9}$/

/**
 * 基本信息表单
 * 修改后调用 /sys/user/update 并同步更新全局用户信息（顶栏头像下拉即时生效）
 */
const InfoForm = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const userInfo = useUserStore((s) => s.userInfo)
  const setUserInfo = useUserStore((s) => s.setUserInfo)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!userInfo) return
    form.setFieldsValue({
      username: userInfo.username,
      realName: userInfo.realName,
      email: userInfo.email,
      mobile: userInfo.mobile,
    })
  }, [userInfo, form])

  const handleSave = (values) => {
    if (!userInfo) return
    setSaving(true)
    updateUser({
      userId: userInfo.userId,
      username: userInfo.username,
      realName: values.realName?.trim(),
      email: values.email?.trim(),
      mobile: values.mobile?.trim(),
      roleId: userInfo.roleId,
      status: userInfo.status ?? 1,
    })
      .then(() => {
        setUserInfo({
          ...userInfo,
          realName: values.realName?.trim(),
          email: values.email?.trim(),
          mobile: values.mobile?.trim(),
        })
        message.success('保存成功')
      })
      .catch((e) => console.error('[InfoForm] save error:', e))
      .finally(() => setSaving(false))
  }

  return (
    <Form
      form={form}
      className="modal-form profile-form"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 18 }}
      onFinish={handleSave}
      autoComplete="off"
    >
      <Form.Item label="用户名" name="username">
        <Input disabled />
      </Form.Item>

      <Form.Item
        label="真实姓名"
        name="realName"
        rules={[
          { required: true, whitespace: true, message: '请输入真实姓名' },
          { max: 50, message: '真实姓名不能超过 50 个字符' },
        ]}
      >
        <Input placeholder="请输入真实姓名" allowClear />
      </Form.Item>

      <Form.Item
        label="邮箱"
        name="email"
        rules={[{ pattern: EMAIL_REG, message: '请输入正确的邮箱地址' }]}
      >
        <Input placeholder="请输入邮箱地址" allowClear />
      </Form.Item>

      <Form.Item
        label="手机号"
        name="mobile"
        rules={[{ pattern: MOBILE_REG, message: '请输入正确的 11 位手机号' }]}
      >
        <Input placeholder="请输入手机号" maxLength={11} allowClear />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 4, span: 18 }}>
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
          保存修改
        </Button>
      </Form.Item>
    </Form>
  )
}

export default InfoForm
