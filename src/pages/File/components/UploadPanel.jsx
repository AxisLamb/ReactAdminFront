import { App, Card, Form, Input, Select, Upload } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { uploadFile } from '../../../api/file'

const { Dragger } = Upload

const MODULE_OPTIONS = [
  { label: 'default（默认）', value: 'default' },
  { label: 'user（用户中心）', value: 'user' },
]

/**
 * 文件上传面板
 * 拖拽 / 点击多选上传，customRequest 走 axios 以获取真实上传进度，
 * 上传归属的业务模块 / 类型 / ID 可在上方设置（可选）
 */
const UploadPanel = ({ onUploaded }) => {
  const { message } = App.useApp()
  const [uploadForm] = Form.useForm()

  const customRequest = ({ file, onProgress, onSuccess, onError }) => {
    const values = uploadForm.getFieldsValue()
    uploadFile(file, {
      serviceModule: values.serviceModule || 'default',
      businessType: values.businessType?.trim() || '',
      businessId: values.businessId?.trim() || '',
      onProgress: (percent) => onProgress({ percent }),
    })
      .then((url) => {
        onSuccess(url, file)
        message.success(`「${file.name}」上传成功`)
        onUploaded?.()
      })
      .catch((e) => {
        console.error('[UploadPanel] upload error:', e)
        onError(e)
      })
  }

  return (
    <Card
      className="table-card upload-card"
      title={
        <span className="table-card-head">
          <span className="table-card-title">文件上传</span>
          <span className="table-card-desc">支持拖拽或点击上传，可同时选择多个文件</span>
        </span>
      }
    >
      <Form
        form={uploadForm}
        layout="inline"
        className="upload-setting-row"
        initialValues={{ serviceModule: 'default' }}
      >
        <Form.Item label="业务模块" name="serviceModule">
          <Select options={MODULE_OPTIONS} style={{ width: 170 }} />
        </Form.Item>
        <Form.Item label="业务类型" name="businessType">
          <Input placeholder="如 avatar、banner（可选）" allowClear style={{ width: 190 }} />
        </Form.Item>
        <Form.Item label="业务ID" name="businessId">
          <Input placeholder="关联业务主键（可选）" allowClear style={{ width: 180 }} />
        </Form.Item>
      </Form>

      <Dragger
        name="file"
        multiple
        maxCount={9}
        className="upload-dragger"
        customRequest={customRequest}
        showUploadList={{ showPreviewIcon: false }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">单次最多 9 个文件，上传进度实时展示，完成后自动刷新列表</p>
      </Dragger>
    </Card>
  )
}

UploadPanel.propTypes = {
  /** 上传成功后的回调（用于刷新文件列表） */
  onUploaded: PropTypes.func,
}

export default UploadPanel
