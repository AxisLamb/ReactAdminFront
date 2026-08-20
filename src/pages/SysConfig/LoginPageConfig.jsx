import { useCallback, useEffect, useState } from 'react'
import {
  App,
  Button,
  Card,
  Image,
  InputNumber,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tooltip,
  Upload,
} from 'antd'
import {
  DeleteOutlined,
  EyeOutlined,
  InboxOutlined,
  PictureOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { getFileList, deleteFile } from '../../api/file'
import { uploadLoginPageImage } from '../../api/sysConfig'
import { getCarouselConfig, saveCarouselConfig } from '../../utils/loginConfig'
import { formatFileSize, formatDate } from '../../utils/helpers'
import './sysconfig.css'

const { Dragger } = Upload

// 后端限制：单张图片不超过 5MB
const MAX_SIZE = 5 * 1024 * 1024
const ACCEPT_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']

/**
 * 登录页配置（/sys/config/loginPage）
 * - 轮播开关 / 轮播间隔（持久化到 localStorage，登录页读取生效）
 * - 登录页图片上传（/sys/config/upload，businessType=loginPage）
 * - 已上传图片列表（file_info 中 businessType=loginPage 的记录），支持预览与删除
 */
function LoginPageConfig() {
  const { message } = App.useApp()

  // ========== 轮播设置 ==========
  const [carousel, setCarousel] = useState(getCarouselConfig)

  const handleEnabledChange = (enabled) => {
    setCarousel((prev) => {
      const next = { ...prev, enabled }
      saveCarouselConfig(next)
      return next
    })
    message.success(enabled ? '轮播已开启，登录页将播放已上传的图片' : '轮播已关闭，登录页恢复默认背景')
  }

  const handleIntervalChange = (value) => {
    if (typeof value !== 'number' || isNaN(value)) return
    setCarousel((prev) => {
      const next = { ...prev, interval: value }
      saveCarouselConfig(next)
      return next
    })
  }

  // ========== 图片列表 ==========
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState(false)

  const loadList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getFileList({ businessType: 'loginPage' })
      // 兼容两种返回结构：纯数组 或 分页对象 {records, total}
      const records = Array.isArray(res) ? res : res?.records || []
      setList(records)
      setTotal(Array.isArray(res) ? records.length : res?.total || 0)
    } catch (e) {
      console.error('[LoginPageConfig] load list error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ========== 上传 ==========
  const beforeUpload = (file) => {
    const isImage = file.type && file.type.startsWith('image/')
    if (!isImage) {
      message.error('只允许上传图片文件')
      return Upload.LIST_IGNORE
    }
    const ext = file.name?.split('.').pop()?.toLowerCase()
    if (!ACCEPT_TYPES.includes(ext)) {
      message.error(`仅支持 ${ACCEPT_TYPES.join(' / ')} 格式`)
      return Upload.LIST_IGNORE
    }
    if (file.size > MAX_SIZE) {
      message.error('图片大小不能超过 5MB')
      return Upload.LIST_IGNORE
    }
    return true
  }

  const customRequest = ({ file, onProgress, onSuccess, onError }) => {
    uploadLoginPageImage(file, (percent) => onProgress({ percent }))
      .then((res) => {
        onSuccess(res, file)
        message.success(`「${file.name}」上传成功`)
        // 上传完成后刷新轮播图片列表
        setPageNum(1)
        loadList()
      })
      .catch((e) => {
        console.error('[LoginPageConfig] upload error:', e)
        onError(e)
      })
  }

  // ========== 删除 ==========
  const handleDelete = async (record) => {
    try {
      await deleteFile(record.fileId)
      message.success('删除成功')
      loadList()
    } catch (e) {
      console.error('[LoginPageConfig] delete error:', e)
    }
  }

  const columns = [
    {
      title: '预览',
      dataIndex: 'filePath',
      key: 'preview',
      width: 96,
      render: (url) =>
        url ? (
          <Image
            src={url}
            width={64}
            height={40}
            className="login-config-thumb"
            preview={{ mask: <EyeOutlined /> }}
          />
        ) : (
          '-'
        ),
    },
    { title: '文件名', dataIndex: 'originalName', key: 'originalName', ellipsis: true },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 110,
      render: (size) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (t) => formatDate(t),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              disabled={!record.filePath}
              onClick={() => window.open(record.filePath, '_blank')}
            >
              预览
            </Button>
          </Tooltip>
          <Popconfirm
            title="确认删除"
            description="删除后登录页轮播将不再包含此图片，确定删除吗？"
            okText="删除"
            okButtonProps={{ danger: true }}
            cancelText="取消"
            onConfirm={() => handleDelete(record)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 轮播设置 */}
      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">轮播设置</span>
            <span className="table-card-desc">控制登录页背景图轮播行为</span>
          </span>
        }
      >
        <div className="login-config-setting">
          <div className="login-config-item">
            <span className="login-config-label">轮播图开关</span>
            <Switch
              checked={carousel.enabled}
              onChange={handleEnabledChange}
              checkedChildren="开"
              unCheckedChildren="关"
            />
          </div>
          <div className="login-config-item">
            <span className="login-config-label">轮播间隔</span>
            <InputNumber
              min={1}
              max={60}
              value={carousel.interval}
              onChange={handleIntervalChange}
              addonAfter="秒"
              style={{ width: 130 }}
            />
          </div>
        </div>
        <p className="login-config-tip">
          开启后，登录页将按设定间隔轮播播放下方已上传的图片；关闭则保持默认渐变背景。
        </p>
      </Card>

      {/* 图片上传 */}
      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">上传登录页图片</span>
            <span className="table-card-desc">支持 jpg / jpeg / png / gif / bmp / webp，单张不超过 5MB</span>
          </span>
        }
      >
        <Dragger
          name="file"
          multiple
          accept="image/*"
          className="upload-dragger"
          beforeUpload={beforeUpload}
          customRequest={customRequest}
          showUploadList={{ showPreviewIcon: false }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽图片到此区域上传</p>
          <p className="ant-upload-hint">可一次选择多张图片，上传成功后自动加入下方轮播列表</p>
        </Dragger>
      </Card>

      {/* 已上传图片列表 */}
      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">
              <PictureOutlined style={{ marginRight: 6 }} />
              轮播图片列表
            </span>
            <span className="table-card-desc">登录页轮播使用的图片，共 {total} 张</span>
          </span>
        }
        extra={
          <Button icon={<ReloadOutlined />} onClick={() => loadList()}>
            刷新
          </Button>
        }
      >
        <Table
          rowKey="fileId"
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{
            current: pageNum,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            // 后端返回全量数组，翻页由 Table 客户端分页完成，无需重新请求
            onChange: (pn, ps) => {
              setPageNum(pn)
              setPageSize(ps)
            },
          }}
        />
      </Card>
    </div>
  )
}

export default LoginPageConfig
