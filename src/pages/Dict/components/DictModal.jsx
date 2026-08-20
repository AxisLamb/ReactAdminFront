import { useEffect, useState } from 'react'
import { App, Form, Input, Modal, Switch } from 'antd'
import PropTypes from 'prop-types'
import { addDict, updateDict } from '@/api/dict'

/**
 * 字典新增 / 编辑弹窗
 */
const DictModal = ({ open, record, onCancel, onSuccess }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const isEdit = !!record
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    form.resetFields()
    if (record) {
      form.setFieldsValue({
        dictName: record.dictName,
        dictType: record.dictType,
        status: record.status === 1,
        remark: record.remark,
      })
    }
  }, [open, record, form])

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setConfirmLoading(true)
        const payload = {
          dictName: values.dictName.trim(),
          dictType: values.dictType.trim(),
          status: values.status ? 1 : 0,
          remark: values.remark?.trim(),
        }
        const request = isEdit
          ? updateDict({ dictId: record.dictId, ...payload })
          : addDict(payload)
        request
          .then(() => {
            message.success(isEdit ? '保存成功' : '新增成功')
            onSuccess()
          })
          .catch((e) => console.error('[DictModal] submit error:', e))
          .finally(() => setConfirmLoading(false))
      })
      .catch(() => {})
  }

  return (
    <Modal
      title={isEdit ? '编辑字典' : '新增字典'}
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
        wrapperCol={{ span: 18 }}
        initialValues={{ status: true }}
        style={{ maxWidth: 480, margin: '20px auto 4px' }}
        autoComplete="off"
      >
        <Form.Item
          label="字典名称"
          name="dictName"
          rules={[
            { required: true, whitespace: true, message: '请输入字典名称' },
            { max: 50, message: '字典名称不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="如：用户状态" allowClear />
        </Form.Item>

        <Form.Item
          label="字典类型"
          name="dictType"
          rules={[
            { required: true, message: '请输入字典类型编码' },
            {
              pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
              message: '以字母开头，仅支持字母、数字与下划线',
            },
          ]}
          extra="唯一编码，供前端按类型读取字典项，如 sys_user_status"
        >
          <Input placeholder="如：sys_user_status" allowClear disabled={isEdit} />
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="正常" unCheckedChildren="禁用" />
        </Form.Item>

        <Form.Item
          label="备注"
          name="remark"
          rules={[{ max: 200, message: '备注不能超过 200 个字符' }]}
        >
          <Input.TextArea placeholder="选填，说明该字典的用途" rows={2} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  )
}

DictModal.propTypes = {
  open: PropTypes.bool.isRequired,
  record: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default DictModal
