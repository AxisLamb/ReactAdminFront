import { useEffect, useState } from 'react'
import { App, Form, Input, InputNumber, Modal, Switch } from 'antd'
import PropTypes from 'prop-types'
import { addDictItem, updateDictItem } from '../../../api/dict'

/**
 * 字典项新增 / 编辑弹窗
 */
const DictItemModal = ({ open, dictId, record, onCancel, onSuccess }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const isEdit = !!record
  const [confirmLoading, setConfirmLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    form.resetFields()
    if (record) {
      form.setFieldsValue({
        itemLabel: record.itemLabel,
        itemValue: record.itemValue,
        orderNum: record.orderNum ?? 0,
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
          dictId,
          itemLabel: values.itemLabel.trim(),
          itemValue: String(values.itemValue).trim(),
          orderNum: values.orderNum ?? 0,
          status: values.status ? 1 : 0,
          remark: values.remark?.trim(),
        }
        const request = isEdit
          ? updateDictItem({ itemId: record.itemId, ...payload })
          : addDictItem(payload)
        request
          .then(() => {
            message.success(isEdit ? '保存成功' : '新增成功')
            onSuccess()
          })
          .catch((e) => console.error('[DictItemModal] submit error:', e))
          .finally(() => setConfirmLoading(false))
      })
      .catch(() => {})
  }

  return (
    <Modal
      title={isEdit ? '编辑字典项' : '新增字典项'}
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
        initialValues={{ status: true, orderNum: 0 }}
        style={{ maxWidth: 480, margin: '20px auto 4px' }}
        autoComplete="off"
      >
        <Form.Item
          label="标签"
          name="itemLabel"
          rules={[
            { required: true, whitespace: true, message: '请输入显示标签' },
            { max: 50, message: '标签不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="如：正常、禁用" allowClear />
        </Form.Item>

        <Form.Item
          label="值"
          name="itemValue"
          rules={[
            { required: true, message: '请输入存储值' },
            { max: 50, message: '值不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="如：1、0" allowClear />
        </Form.Item>

        <Form.Item label="排序号" name="orderNum">
          <InputNumber min={0} max={9999} precision={0} style={{ width: 140 }} />
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="正常" unCheckedChildren="禁用" />
        </Form.Item>

        <Form.Item
          label="备注"
          name="remark"
          rules={[{ max: 200, message: '备注不能超过 200 个字符' }]}
        >
          <Input.TextArea placeholder="选填" rows={2} allowClear />
        </Form.Item>
      </Form>
    </Modal>
  )
}

DictItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  /** 所属字典 ID */
  dictId: PropTypes.number.isRequired,
  record: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default DictItemModal
