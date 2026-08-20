import { useEffect, useState } from 'react'
import { App, Button, Card, Form, Input, Select, Space, Table, Tag } from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { deleteUsers, getUserPage } from '@/api/user'
import { getRoles } from '@/api/role'
import useDict from '@/hooks/useDict'
import Permission from '@/components/Permission'
import UserModal from '@/pages/sys/User/components/UserModal'
import '@/styles/list-page.css'

const AVATAR_COLORS = [
  '#1890FF', '#52C41A', '#FAAD14', '#722ED1',
  '#13C2C2', '#EB2F96', '#FA541C', '#2F54EB',
]

/** 根据用户名生成稳定头像底色 */
const avatarColor = (name) => {
  let hash = 0
  for (const ch of String(name || '')) hash = (hash + ch.charCodeAt(0)) % 997
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/**
 * 用户管理列表页
 * 条件搜索（用户名/真实姓名/状态）+ 分页表格 + 批量删除 + 新增/编辑弹窗
 */
const UserList = () => {
  const { message, modal } = App.useApp()
  const [searchForm] = Form.useForm()
  const { getDictOptions } = useDict('sys_user_status')
  const statusOptions = getDictOptions('sys_user_status')

  const [loading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchValues, setSearchValues] = useState({})
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [roles, setRoles] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState(null)

  /** 拉取分页数据 */
  const fetchData = (current = 1, pageSize = 10, values = searchValues) => {
    setLoading(true)
    const params = { current, size: pageSize }
    if (values.username) params.username = values.username.trim()
    if (values.realName) params.realName = values.realName.trim()
    if (values.status !== undefined && values.status !== null && values.status !== '') {
      params.status = Number(values.status)
    }
    getUserPage(params)
      .then((data) => {
        setList(data.records || [])
        setPagination({
          current: data.current || current,
          pageSize: data.size || pageSize,
          total: data.total || 0,
        })
      })
      .catch((e) => console.error('[UserList] fetch error:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData(1, 10, {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** 拉取角色列表（每次打开弹窗刷新，保证新增角色后立即可选） */
  const loadRoles = () => {
    getRoles()
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch((e) => console.error('[UserList] load roles error:', e))
  }

  /** 搜索 / 重置 */
  const handleSearch = (values) => {
    setSearchValues(values)
    setSelectedRowKeys([])
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    handleSearch({})
  }

  /** 分页变化 */
  const handleTableChange = (pag) => {
    fetchData(pag.current, pag.pageSize)
  }

  /** 删除（单条 / 批量），删完当前页最后一条自动回退上一页 */
  const handleDelete = (records) => {
    const ids = records.map((r) => r.userId)
    const isSingle = records.length === 1
    modal.confirm({
      title: '确认删除',
      content: isSingle
        ? `即将删除用户「${records[0].username}」，删除后不可恢复，确定继续吗？`
        : `即将删除选中的 ${records.length} 个用户，删除后不可恢复，确定继续吗？`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () =>
        deleteUsers(ids).then(() => {
          message.success('删除成功')
          setSelectedRowKeys((keys) => keys.filter((k) => !ids.includes(k)))
          const backOnePage =
            isSingle && list.length === 1 && pagination.current > 1
              ? pagination.current - 1
              : pagination.current
          fetchData(backOnePage, pagination.pageSize)
        }),
    })
  }

  const openModal = (record = null) => {
    setEditingRecord(record)
    setModalOpen(true)
    // 打开弹窗时刷新角色列表，新增角色后无需刷新页面即可选择
    loadRoles()
  }

  const handleModalSuccess = () => {
    setModalOpen(false)
    setEditingRecord(null)
    fetchData(pagination.current, pagination.pageSize)
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      width: 180,
      render: (text) => (
        <span className="user-cell">
          <span className="user-cell-avatar" style={{ background: avatarColor(text) }}>
            {String(text || '?').charAt(0).toUpperCase()}
          </span>
          <span className="user-cell-name">{text}</span>
        </span>
      ),
    },
    { title: '真实姓名', dataIndex: 'realName', width: 120, render: (t) => t || '-' },
    { title: '邮箱', dataIndex: 'email', ellipsis: true, render: (t) => t || '-' },
    { title: '手机号', dataIndex: 'mobile', width: 130, render: (t) => t || '-' },
    {
      title: '角色',
      dataIndex: 'roleName',
      width: 120,
      render: (t) => (t ? <Tag color="blue">{t}</Tag> : '-'),
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
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4} split={<span className="action-divider">|</span>}>
          <Permission perms="sys:user:update">
            <Button
              type="link"
              className="action-link"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              编辑
            </Button>
          </Permission>
          <Permission perms="sys:user:delete">
            <Button
              type="link"
              danger
              className="action-link"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete([record])}
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
      {/* 搜索卡片 */}
      <div className="search-card">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item label="用户名" name="username">
            <Input placeholder="请输入用户名" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label="真实姓名" name="realName">
            <Input placeholder="请输入真实姓名" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              placeholder="全部"
              allowClear
              options={statusOptions}
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
            <span className="table-card-title">用户列表</span>
            <span className="table-card-desc">管理系统登录账号，分配角色并控制启用状态</span>
          </span>
        }
        extra={
          <Space>
            <Permission perms="sys:user:save">
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
                新增用户
              </Button>
            </Permission>
            <Permission perms="sys:user:delete">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={!selectedRowKeys.length}
                onClick={() =>
                  handleDelete(list.filter((r) => selectedRowKeys.includes(r.userId)))
                }
              >
                批量删除{selectedRowKeys.length ? `（${selectedRowKeys.length}）` : ''}
              </Button>
            </Permission>
          </Space>
        }
      >
        <Table
          className="list-table"
          rowKey="userId"
          columns={columns}
          dataSource={list}
          loading={loading}
          size="middle"
          scroll={{ x: 1000 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              // 超级管理员不允许勾选删除
              disabled: record.userId === 1,
            }),
          }}
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

      <UserModal
        open={modalOpen}
        record={editingRecord}
        roles={roles}
        onCancel={() => {
          setModalOpen(false)
          setEditingRecord(null)
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default UserList
