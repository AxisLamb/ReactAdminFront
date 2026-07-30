import { useEffect, useState } from 'react'
import {
  App, AutoComplete, Button, Card, Form, Input, Space, Table, Tag, Tooltip,
} from 'antd'
import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LinkOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { deleteFile, downloadFile, getFilePage } from '../../api/file'
import Permission from '../../components/Permission'
import { formatBytes, formatDateTime } from '../../utils/helpers'
import { getFileMeta } from './fileMeta'
import UploadPanel from './components/UploadPanel'
import LinkModal from './components/LinkModal'
import '../../styles/list-page.css'
import './file-list.css'

const MODULE_SUGGESTIONS = [{ value: 'default' }, { value: 'user' }]

/**
 * 文件管理列表页
 * 拖拽上传（实时进度）+ 业务维度搜索 + 下载 / 访问链接 / 删除
 */
const FileList = () => {
  const { message, modal } = App.useApp()
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchValues, setSearchValues] = useState({})
  const [linkRecord, setLinkRecord] = useState(null)

  /** 拉取分页数据 */
  const fetchData = (current = 1, pageSize = 10, values = searchValues) => {
    setLoading(true)
    const params = { current, size: pageSize }
    if (values.serviceModule) params.serviceModule = values.serviceModule.trim()
    if (values.businessType) params.businessType = values.businessType.trim()
    if (values.businessId) params.businessId = values.businessId.trim()
    getFilePage(params)
      .then((data) => {
        setList(data.records || [])
        setPagination({
          current: data.current || current,
          pageSize: data.size || pageSize,
          total: data.total || 0,
        })
      })
      .catch((e) => console.error('[FileList] fetch error:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData(1, 10, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (values) => {
    setSearchValues(values)
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    handleSearch({})
  }

  const handleTableChange = (pag) => fetchData(pag.current, pag.pageSize)

  /** 复制存储路径 */
  const handleCopyPath = (text) => {
    const done = () => message.success('已复制存储路径')
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        console.error('[FileList] copy failed')
      })
    }
  }

  /** 下载（blob 流，错误由 request 层兜底提示） */
  const handleDownload = (record) => {
    downloadFile(record.fileId, record.originalName)
  }

  /** 删除（二次确认，删完当前页最后一条自动回退上一页） */
  const handleDelete = (record) => {
    modal.confirm({
      title: '确认删除',
      content: `即将删除文件「${record.originalName}」，删除后不可恢复，确定继续吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () =>
        deleteFile(record.fileId).then(() => {
          message.success('删除成功')
          const backOnePage =
            list.length === 1 && pagination.current > 1
              ? pagination.current - 1
              : pagination.current
          fetchData(backOnePage, pagination.pageSize)
        }),
    })
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'originalName',
      width: 250,
      render: (name, record) => {
        const meta = getFileMeta(name)
        const Icon = meta.icon
        return (
          <span className="file-name-cell">
            <span
              className="file-ext-icon"
              style={{ color: meta.color, background: `${meta.color}1a` }}
            >
              <Icon />
            </span>
            <span className="file-name-body">
              <Tooltip title={name}>
                <span className="file-name-text">{name}</span>
              </Tooltip>
              <span className="file-name-id">ID: {record.fileId}</span>
            </span>
          </span>
        )
      },
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      width: 90,
      render: (t) =>
        t ? <Tag className="file-type-tag">{String(t).replace('.', '').toUpperCase()}</Tag> : '-',
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      width: 100,
      render: (v) => (v === null || v === undefined ? '-' : formatBytes(v)),
    },
    {
      title: '存储路径',
      dataIndex: 'filePath',
      width: 220,
      render: (path) =>
        path ? (
          <span className="code-copy-wrap">
            <Tooltip title={path}>
              <span className="code-tag file-path-tag">{path}</span>
            </Tooltip>
            <Button
              type="text"
              size="small"
              className="code-copy-btn"
              icon={<CopyOutlined />}
              onClick={() => handleCopyPath(path)}
            />
          </span>
        ) : (
          '-'
        ),
    },
    { title: '业务模块', dataIndex: 'serviceModule', width: 100, render: (t) => t || '-' },
    { title: '业务类型', dataIndex: 'businessType', width: 110, render: (t) => t || '-' },
    { title: '业务ID', dataIndex: 'businessId', width: 100, render: (t) => t || '-' },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      width: 170,
      render: (t) => formatDateTime(t),
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} split={<span className="action-divider">|</span>}>
          <Button
            type="link"
            className="action-link"
            icon={<LinkOutlined />}
            onClick={() => setLinkRecord(record)}
          >
            链接
          </Button>
          <Button
            type="link"
            className="action-link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
          >
            下载
          </Button>
          <Permission perms="sys:file:delete">
            <Button
              type="link"
              danger
              className="action-link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Permission>
        </Space>
      ),
    },
  ]

  return (
    <div className="list-page">
      {/* 上传面板（无上传权限时整体隐藏） */}
      <Permission perms="sys:file:upload">
        <UploadPanel onUploaded={() => fetchData(1, pagination.pageSize)} />
      </Permission>

      {/* 搜索卡片 */}
      <div className="search-card">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="业务模块" name="serviceModule">
            <AutoComplete
              placeholder="全部"
              allowClear
              options={MODULE_SUGGESTIONS}
              style={{ width: 150 }}
            />
          </Form.Item>
          <Form.Item label="业务类型" name="businessType">
            <Input placeholder="请输入业务类型" allowClear style={{ width: 170 }} />
          </Form.Item>
          <Form.Item label="业务ID" name="businessId">
            <Input placeholder="请输入业务ID" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>

      {/* 表格卡片 */}
      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">文件列表</span>
            <span className="table-card-desc">按业务模块 / 类型 / ID 检索已上传的文件</span>
          </span>
        }
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        }
      >
        <Table
          className="list-table"
          rowKey="fileId"
          columns={columns}
          dataSource={list}
          loading={loading}
          size="middle"
          scroll={{ x: 1300 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <LinkModal
        open={!!linkRecord}
        record={linkRecord}
        onClose={() => setLinkRecord(null)}
      />
    </div>
  )
}

export default FileList
