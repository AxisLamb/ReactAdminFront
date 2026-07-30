import { useEffect, useState } from 'react'
import { App, Button, Card, Form, Input, Select, Space, Table, Tag, Tooltip } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { deleteRole, getRolePage } from '../../api/role'
import { formatDate } from '../../utils/helpers'
import Permission from '../../components/Permission'
import RoleModal from './components/RoleModal'
import '../../styles/list-page.css'

const ROLE_STATUS_OPTIONS = [
  { label: '正常', value: '1' },
  { label: '禁用', value: '0' },
]

/**
 * 角色管理列表页
 * 条件搜索（角色名称/状态）+ 分页表格 + 新增/编辑弹窗（含菜单权限树分配）
 */
const RoleList = () => {
  const { message, modal } = App.useApp()
  const [searchForm] = Form.useForm()

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchValues, setSearchValues] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  /** 拉取分页数据 */
  const fetchData = (current = 1, pageSize = 10, values = searchValues) => {
    setLoading(true)
    const params = { current, size: pageSize }
    if (values.roleName) params.roleName = values.roleName.trim()
    if (values.status !== undefined && values.status !== null && values.status !== '') {
      params.status = Number(values.status)
    }
    getRolePage(params)
      .then((data) => {
        setList(data.records || [])
        setPagination({
          current: data.current || current,
          pageSize: data.size || pageSize,
          total: data.total || 0,
        })
      })
      .catch((e) => console.error('[RoleList] fetch error:', e))
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

  const handleTableChange = (pag) => {
    fetchData(pag.current, pag.pageSize)
  }

  /** 删除角色（Query 参数方式），删完当前页最后一条自动回退上一页 */
  const handleDelete = (record) => {
    modal.confirm({
      title: '确认删除',
      content: `即将删除角色「${record.roleName}」，删除后不可恢复，确定继续吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () =>
        deleteRole(record.roleId).then(() => {
          message.success('删除成功')
          const backOnePage =
            list.length === 1 && pagination.current > 1
              ? pagination.current - 1
              : pagination.current
          fetchData(backOnePage, pagination.pageSize)
        }),
    })
  }

  const openModal = (record = null) => {
    setEditingRecord(record)
    setModalOpen(true)
  }

  const handleModalSuccess = () => {
    setModalOpen(false)
    setEditingRecord(null)
    fetchData(pagination.current, pagination.pageSize)
  }

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      width: 200,
      render: (text, record) => (
        <Space size={8}>
          <span className="user-cell-name">{text}</span>
          {record.roleId === 1 && <Tag color="gold">内置</Tag>}
        </Space>
      ),
    },
    {
      title: '角色描述',
      dataIndex: 'roleDesc',
      ellipsis: { showTitle: false },
      render: (text) =>
        text ? (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status) =>
        status === 1 ? (
          <Tag color="success" className="status-tag">
            <span className="dot" />
            正常
          </Tag>
        ) : (
          <Tag className="status-tag">
            <span className="dot" />
            禁用
          </Tag>
        ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
      render: (t) => formatDate(t),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} split={<span className="action-divider">|</span>}>
          <Permission perms="sys:role:update">
            <Button
              type="link"
              className="action-link"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Permission>
          {/* 内置管理员角色不允许删除 */}
          {record.roleId !== 1 && (
            <Permission perms="sys:role:delete">
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
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="list-page">
      {/* 搜索卡片 */}
      <div className="search-card">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="角色名称" name="roleName">
            <Input placeholder="请输入角色名称" allowClear style={{ width: 200 }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              placeholder="全部"
              allowClear
              options={ROLE_STATUS_OPTIONS}
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

      {/* 表格卡片 */}
      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">角色列表</span>
            <span className="table-card-desc">维护角色并为角色分配菜单与按钮权限</span>
          </span>
        }
        extra={
          <Permission perms="sys:role:save">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增角色
            </Button>
          </Permission>
        }
      >
        <Table
          className="list-table"
          rowKey="roleId"
          columns={columns}
          dataSource={list}
          loading={loading}
          size="middle"
          scroll={{ x: 900 }}
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

      <RoleModal
        open={modalOpen}
        record={editingRecord}
        onCancel={() => {
          setModalOpen(false)
          setEditingRecord(null)
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default RoleList
