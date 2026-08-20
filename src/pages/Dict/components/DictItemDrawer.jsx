import { useEffect, useState } from 'react'
import { App, Button, Drawer, Form, Input, Select, Space, Table, Tag, Tooltip } from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import Permission from '@/components/Permission'
import { deleteDictItem, getDictItemPage } from '@/api/dict'
import DictItemModal from '@/pages/Dict/components/DictItemModal'

const STATUS_OPTIONS = [
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 },
]

/**
 * 字典项管理抽屉：针对某个字典维护其字典项（标签/值/排序/状态）
 */
const DictItemDrawer = ({ dict, onClose, onSuccess }) => {
  const { message, modal } = App.useApp()
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchValues, setSearchValues] = useState({})
  const [modalState, setModalState] = useState({ open: false, record: null })

  const open = !!dict

  const fetchData = (page = pagination.current, size = pagination.pageSize, values = searchValues) => {
    if (!dict) return
    setLoading(true)
    getDictItemPage({ current: page, size, dictId: dict.dictId, ...values })
      .then((res) => {
        setList(res.records || [])
        setPagination((prev) => ({ ...prev, current: page, pageSize: size, total: res.total || 0 }))
      })
      .catch((e) => console.error('[DictItemDrawer] fetch error:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (open) {
      searchForm.resetFields()
      setSearchValues({})
      fetchData(1, 10, {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dict])

  const handleSearch = () => {
    const values = searchForm.getFieldsValue()
    setSearchValues(values)
    fetchData(1, pagination.pageSize, values)
  }

  const handleDelete = (record) => {
    modal.confirm({
      title: '确认删除该字典项？',
      content: `字典项「${record.itemLabel}」删除后，引用该值的下拉选项将显示原值。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () =>
        deleteDictItem(record.itemId).then(() => {
          message.success('删除成功')
          onSuccess?.(dict.dictType)
          if (pagination.total > 1 && list.length === 1 && pagination.current > 1) {
            fetchData(pagination.current - 1)
          } else {
            fetchData()
          }
        }),
    })
  }

  const columns = [
    {
      title: '标签',
      dataIndex: 'itemLabel',
      key: 'itemLabel',
      width: 140,
      render: (label) => <span style={{ fontWeight: 500 }}>{label}</span>,
    },
    {
      title: '值',
      dataIndex: 'itemValue',
      key: 'itemValue',
      width: 120,
      render: (value) => <code className="code-tag">{value}</code>,
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 70,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
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
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Permission perms="sys:dict:item:update">
            <Button
              type="link"
              size="small"
              className="action-link"
              onClick={() => setModalState({ open: true, record })}
            >
              编辑
            </Button>
          </Permission>
          <Permission perms="sys:dict:item:delete">
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
    <Drawer
      title={
        <span className="drawer-title">
          字典项管理
          {dict && (
            <Tag color="blue" className="drawer-title-tag">
              {dict.dictName} · {dict.dictType}
            </Tag>
          )}
        </span>
      }
      width={760}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={
        <Permission perms="sys:dict:item:save">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalState({ open: true, record: null })}
          >
            新增字典项
          </Button>
        </Permission>
      }
    >
      <Form form={searchForm} layout="inline" onFinish={handleSearch} className="drawer-search">
        <Form.Item label="标签" name="itemLabel">
          <Input placeholder="请输入标签" allowClear style={{ width: 160 }} />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select placeholder="全部" options={STATUS_OPTIONS} allowClear style={{ width: 110 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
            搜索
          </Button>
        </Form.Item>
      </Form>

      <Table
        rowKey="itemId"
        className="list-table"
        columns={columns}
        dataSource={list}
        loading={loading}
        size="middle"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => fetchData(page, size),
        }}
      />

      {dict && (
        <DictItemModal
          open={modalState.open}
          dictId={dict.dictId}
          record={modalState.record}
          onCancel={() => setModalState({ open: false, record: null })}
          onSuccess={() => {
            setModalState({ open: false, record: null })
            onSuccess?.(dict.dictType)
            fetchData()
          }}
        />
      )}
    </Drawer>
  )
}

DictItemDrawer.propTypes = {
  /** 当前管理的字典记录，为 null 时抽屉关闭 */
  dict: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  /** 字典项变更回调，参数为字典类型（用于失效缓存） */
  onSuccess: PropTypes.func,
}

export default DictItemDrawer
