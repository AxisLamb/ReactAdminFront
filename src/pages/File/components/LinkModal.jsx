import { useEffect, useState } from 'react'
import { App, Button, Input, Modal, Space, Spin, Tag } from 'antd'
import { CopyOutlined, ExportOutlined, LinkOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { getFileUrlByFileId } from '../../../api/file'

/** 复制文本（clipboard 不可用时降级为 textarea 选中复制） */
const copyText = (text, done) => {
  const fallback = () => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    done()
  }
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(fallback)
  } else {
    fallback()
  }
}

/**
 * 文件访问链接弹窗
 * 打开时调用 /images/getFileUrlByFileId 换取真实访问地址，支持一键复制与新窗口打开
 */
const LinkModal = ({ open, record, onClose }) => {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (!open || !record) return
    setLoading(true)
    setUrl('')
    getFileUrlByFileId(record.fileId)
      .then((data) => setUrl(data || ''))
      .catch((e) => console.error('[LinkModal] fetch url error:', e))
      .finally(() => setLoading(false))
  }, [open, record])

  const handleCopy = () => {
    if (!url) return
    copyText(url, () => message.success('链接已复制'))
  }

  return (
    <Modal
      title={
        <span className="link-modal-title">
          <LinkOutlined />
          文件访问链接
        </span>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnHidden
    >
      <div className="link-modal-file">
        <Tag color="processing">{record?.originalName}</Tag>
        <span className="link-modal-id">fileId: {record?.fileId}</span>
      </div>

      {loading ? (
        <div className="link-modal-loading">
          <Spin tip="正在获取访问链接..." />
        </div>
      ) : (
        <Input.TextArea value={url} readOnly autoSize={{ minRows: 2, maxRows: 4 }} />
      )}

      <div className="link-modal-actions">
        <Space>
          <Button icon={<CopyOutlined />} disabled={!url} onClick={handleCopy}>
            复制链接
          </Button>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            disabled={!url}
            onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
          >
            新窗口打开
          </Button>
        </Space>
      </div>
    </Modal>
  )
}

LinkModal.propTypes = {
  open: PropTypes.bool.isRequired,
  record: PropTypes.object,
  onClose: PropTypes.func.isRequired,
}

export default LinkModal
