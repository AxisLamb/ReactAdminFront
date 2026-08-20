import { useEffect, useState } from 'react'
import { App, Button, Card, Form, Input, Select, Space, Table, Tag, Tooltip } from 'antd'
import { OrderedListOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import Permission from '@/components/Permission'
import { deleteDict, getDictPage } from '@/api/dict'
import { useDictStore } from '@/store/dictStore'
import DictModal from '@/pages/sys/Dict/components/DictModal'
import DictItemDrawer from '@/pages/sys/Dict/components/DictItemDrawer'
import '@/styles/list-page.css'

/** 字典状态选项（字典自身状态无对应字典类型，使用固定选项避免循环依赖） */
const STATUS_OPTIONS = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 },
]

/**
 * 数据字典管理：字典列表 CRUD，点击「字典项」进入字典项管理抽屉
 */
const DictList = () => {
  const { message, modal } = App.useApp()
  const [searchForm] = Form.useForm()
  const clearCache = useDictStore((s) => s.clearCache)

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchValues, setSearchValues] = useState({})
  const [modalState, setModalState] = useState({ open: false, record: null })
  const [itemDict, setItemDict] = useState(null)

  const fetchData = (page = pagination.current, size = pagination.pageSize, values = searchValues) => {
    setLoading(true)
    getDictPage({ current: page, size, ...values })
      .then((res) => {
        setList(res.records || [])
        setPagination((prev) => ({ ...prev, current: page, pageSize: size, total: res.total || 0 }))
      })
      .catch((e) => console.error('[DictList] fetch error:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData(1, 10, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setSearchValues(values)
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    setSearchValues({})
    fetchData(1, pagination.pageSize, {})
  }

  const handleDelete = (record) => {
    modal.confirm({
      title: '确认删除该字典？',
      content: `字典「${record.dictName}」及其全部字典项将一并删除，且不可恢复。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () =>
        deleteDict(record.dictId).then(() => {
          message.success('删除成功')
          clearCache(record.dictType)
          if (pagination.total > 1 && list.length === 1 && pagination.current > 1) {
            fetchData(pagination.current - 1)
          } else {
            fetchData()
          }
        }),
    })
  }

  /** 字典项变更成功后：刷新列表并失效对应字典缓存 */
  const handleItemSuccess = (dictType) => {
    clearCache(dictType)
    fetchData()
  }

  const columns = [
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName',
      width: 200,
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType',
      width: 220,
      render: (type) => (
        <span className="code-copy-wrap">
          <code className="code-tag">{type}</code>
          <Tooltip title="复制类型编码">
            <Button
              type="text"
              size="small"
              className="code-copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(type)
                message.success('已复制字典类型')
              }}
            >
              复制
            </Button>
          </Tooltip>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status) =>
        status === 1 ? (
          <Tag color="success" className="status-tag">
            <span className="dot" />
            正常
          </Tag>
        ) : (
          <Tag color="default" className="status-tag">
            <span className="dot" />
            禁用
          </Tag>
        ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: { showTitle: false },
      render: (remark) =>
        remark ? (
          <Tooltip title={remark}>
            <span>{remark}</span>
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 210,
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            className="action-link"
            icon={<OrderedListOutlined />}
            onClick={() => setItemDict(record)}
          >
            字典项
          </Button>
          <Permission perms="sys:dict:update">
            <Button
              type="link"
              size="small"
              className="action-link"
              onClick={() => setModalState({ open: true, record })}
            >
              编辑
            </Button>
          </Permission>
          <Permission perms="sys:dict:delete">
            <Button
              type="link"
              size="small"
              danger
              className="action-link"
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
      <div className="search-card">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="字典名称" name="dictName">
            <Input placeholder="请输入字典名称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label="字典类型" name="dictType">
            <Input placeholder="如 sys_user_status" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              placeholder="全部"
              options={STATUS_OPTIONS}
              allowClear
              style={{ width: 120 }}
            />
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

      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">字典列表</span>
            <span className="table-card-desc">管理系统中的枚举值与下拉选项数据</span>
          </span>
        }
        extra={
          <Permission perms="sys:dict:save">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalState({ open: true, record: null })}
            >
              新增字典
            </Button>
          </Permission>
        }
      >
        <Table
          rowKey="dictId"
          className="list-table"
          columns={columns}
          dataSource={list}
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, size) => fetchData(page, size),
          }}
        />
      </Card>

      <DictModal
        open={modalState.open}
        record={modalState.record}
        onCancel={() => setModalState({ open: false, record: null })}
        onSuccess={() => {
          setModalState({ open: false, record: null })
          clearCache()
          fetchData()
        }}
      />

      <DictItemDrawer dict={itemDict} onClose={() => setItemDict(null)} onSuccess={handleItemSuccess} />
    </div>
  )
}

export default DictList
