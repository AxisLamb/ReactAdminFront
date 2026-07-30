import { useEffect, useState } from 'react'
import { App, Form, Input, Modal, Select, Switch } from 'antd'
import PropTypes from 'prop-types'
import { saveUser, updateUser } from '../../../api/user'

const EMAIL_REG = /^[\w.%+-]+@[\w-]+(\.[\w-]+)+$/
const MOBILE_REG = /^1[3-9]\d{9}$/

/**
 * 用户新增 / 编辑弹窗
 * - 新增时密码必填，编辑时隐藏密码字段
 * - 邮箱 / 手机号正则校验，角色下拉，状态开关
 * - 提交按钮 loading 防重复
 */
const UserModal = ({ open, record, roles, onCancel, onSuccess }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [confirmLoading, setConfirmLoading] = useState(false)
  const isEdit = !!record

  useEffect(() => {
    if (!open) return
    if (record) {
      form.setFieldsValue({
        username: record.username,
        realName: record.realName,
        email: record.email,
        mobile: record.mobile,
        roleId: record.roleId,
        status: record.status === 1,
      })
    } else {
      form.resetFields()
    }
  }, [open, record, form])

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setConfirmLoading(true)
        const payload = {
          username: values.username.trim(),
          realName: values.realName?.trim(),
          email: values.email?.trim(),
          mobile: values.mobile?.trim(),
          roleId: values.roleId,
          status: values.status ? 1 : 0,
        }
        if (!isEdit) payload.password = values.password
        const request = isEdit
          ? updateUser({ userId: record.userId, ...payload })
          : saveUser(payload)
        request
          .then(() => {
            message.success(isEdit ? '保存成功' : '新增成功')
            onSuccess()
          })
          .catch((e) => console.error('[UserModal] submit error:', e))
          .finally(() => setConfirmLoading(false))
      })
      .catch(() => {})
  }

  return (
    <Modal
      title={isEdit ? '编辑用户' : '新增用户'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="保存"
      cancelText="取消"
      width={560}
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        className="modal-form"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 17 }}
        initialValues={{ status: true }}
        style={{ maxWidth: 480, margin: '20px auto 4px' }}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[
            { required: true, whitespace: true, message: '请输入用户名' },
            { max: 50, message: '用户名不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="请输入登录用户名" allowClear />
        </Form.Item>

        {!isEdit && (
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, whitespace: true, message: '请输入密码' },
              { min: 5, message: '密码至少 5 个字符' },
            ]}
          >
            <Input.Password placeholder="请输入登录密码" autoComplete="new-password" />
          </Form.Item>
        )}

        <Form.Item
          label="真实姓名"
          name="realName"
          rules={[{ max: 50, message: '真实姓名不能超过 50 个字符' }]}
        >
          <Input placeholder="请输入真实姓名" allowClear />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            {
              pattern: EMAIL_REG,
              message: '请输入正确的邮箱地址',
            },
          ]}
        >
          <Input placeholder="请输入邮箱地址" allowClear />
        </Form.Item>

        <Form.Item
          label="手机号"
          name="mobile"
          rules={[
            {
              pattern: MOBILE_REG,
              message: '请输入正确的 11 位手机号',
            },
          ]}
        >
          <Input placeholder="请输入手机号" maxLength={11} allowClear />
        </Form.Item>

        <Form.Item label="角色" name="roleId">
          <Select
            placeholder="请选择角色"
            allowClear
            showSearch
            optionFilterProp="label"
            options={roles.map((r) => ({ label: r.roleName, value: r.roleId }))}
          />
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="正常" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

UserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  record: PropTypes.object,
  roles: PropTypes.array,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default UserModal
