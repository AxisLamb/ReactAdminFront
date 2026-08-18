import { useEffect, useMemo, useState } from 'react'
import { App, Button, Card, Space, Table, Tag, Tooltip } from 'antd'
import {
  NodeExpandOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShrinkOutlined,
} from '@ant-design/icons'
import Permission from '../../components/Permission'
import { MENU_ICONS } from '../../components/IconSelect/iconMap'
import { deleteMenu, getMenuListAll } from '../../api/menu'
import { collectTreeKeys, listToTree } from '../../utils/helpers'
import MenuModal from './components/MenuModal'
import '../../styles/list-page.css'

/** 菜单类型元信息：0 目录 / 1 菜单 / 2 按钮 */
const MENU_TYPES = {
  0: { label: '菜单', color: 'blue' },
  1: { label: '页面', color: 'green' },
  2: { label: '按钮', color: 'orange' },
  3: { label: '接口目录', color: 'red' },
  4: { label: '业务', color: 'green' },
  5: { label: '接口', color: 'orange' },
}

/**
 * 菜单管理：树形表格展示全部菜单（目录/菜单/按钮），
 * 支持一键展开/折叠、新增子级、编辑与删除（含子级时禁删）
 */
const MenuList = () => {
  const { message, modal } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [tree, setTree] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [modalState, setModalState] = useState({
    open: false,
    record: null,
    parent: null,
  })

  const fetchData = () => {
    setLoading(true)
    getMenuListAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        // 后端返回扁平列表（含 parentId），转为树形结构供 Table 展示
        const treeData = list.length && !list[0].children ? listToTree(list) : list
        setTree(treeData)
        // 默认展开全部，便于总览层级结构
        setExpandedKeys(collectTreeKeys(treeData, 'menuId'))
      })
      .catch((e) => console.error('[MenuList] fetch error:', e))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  /** 菜单总数（含按钮） */
  const totalCount = useMemo(() => collectTreeKeys(tree, 'menuId').length, [tree])

  const handleDelete = (record) => {
    modal.confirm({
      title: '确认删除该菜单？',
      content: `菜单「${record.name}」删除后不可恢复，关联的角色权限将同步失效。`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () =>
        deleteMenu(record.menuId).then(() => {
          message.success('删除成功')
          fetchData()
        }),
    })
  }

  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (name, record) => {
        const IconComp = MENU_ICONS[record.icon]
        return (
          <span className="menu-name-cell">
            {IconComp && (
              <span className="menu-name-icon">
                <IconComp />
              </span>
            )}
            <span className="menu-name-text">{name}</span>
          </span>
        )
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      align: 'center',
      render: (type) => {
        const meta = MENU_TYPES[type] || { label: '未知', color: 'default' }
        return <Tag color={meta.color}>{meta.label}</Tag>
      },
    },
    {
      title: '菜单 URL',
      dataIndex: 'url',
      key: 'url',
      width: 180,
      render: (url) => (url ? <code className="code-tag">{url}</code> : '-'),
    },
    {
      title: '组件名称',
      dataIndex: 'reactComponent',
      key: 'reactComponent',
      width: 140,
      render: (comp) => (comp ? <code className="code-tag">{comp}</code> : '-'),
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
      key: 'perms',
      width: 180,
      render: (perms) => (perms ? <code className="code-tag">{perms}</code> : '-'),
    },
    // {
    //   title: '排序',
    //   dataIndex: 'orderNum',
    //   key: 'orderNum',
    //   width: 80,
    //   align: 'center',
    // },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_, record) => (
        <Space size={4}>
          {record.type !== 2 && record.type !== 5 && (
            <Permission perms="sys:menu:save">
              <Button
                type="link"
                size="small"
                className="action-link"
                onClick={() => setModalState({ open: true, record: null, parent: record })}
              >
                新增子级
              </Button>
            </Permission>
          )}
          <Permission perms="sys:menu:update">
            <Button
              type="link"
              size="small"
              className="action-link"
              onClick={() => setModalState({ open: true, record, parent: null })}
            >
              编辑
            </Button>
          </Permission>
          <Permission perms="sys:menu:delete">
            {record.children && record.children.length > 0 ? (
              <Tooltip title="存在子级菜单，请先删除子级">
                <Button type="link" size="small" danger disabled>
                  删除
                </Button>
              </Tooltip>
            ) : (
              <Button
                type="link"
                size="small"
                danger
                className="action-link"
                onClick={() => handleDelete(record)}
              >
                删除
              </Button>
            )}
          </Permission>
        </Space>
      ),
    },
  ]

  return (
    <div className="list-page">
      <Card
        className="table-card"
        title={
          <span className="table-card-head">
            <span className="table-card-title">菜单管理</span>
            <span className="table-card-desc">
              共 {totalCount} 个节点（目录 / 菜单 / 按钮）
            </span>
          </span>
        }
        extra={
          <Space>
            <Button
              icon={<NodeExpandOutlined />}
              onClick={() => setExpandedKeys(collectTreeKeys(tree, 'menuId'))}
            >
              展开全部
            </Button>
            <Button icon={<ShrinkOutlined />} onClick={() => setExpandedKeys([])}>
              折叠全部
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              刷新
            </Button>
            <Permission perms="sys:menu:save">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalState({ open: true, record: null, parent: null })}
              >
                新增菜单
              </Button>
            </Permission>
          </Space>
        }
      >
        <Table
          rowKey="menuId"
          className="list-table"
          columns={columns}
          dataSource={tree}
          loading={loading}
          pagination={false}
          size="middle"
          scroll={{ x: 1100 }}
          expandable={{
            expandedKeys,
            onExpand: (expanded, record) =>
              setExpandedKeys((keys) =>
                expanded ? [...keys, record.menuId] : keys.filter((k) => k !== record.menuId),
              ),
          }}
        />
      </Card>

      <MenuModal
        open={modalState.open}
        record={modalState.record}
        parent={modalState.parent}
        onCancel={() => setModalState({ open: false, record: null, parent: null })}
        onSuccess={() => {
          setModalState({ open: false, record: null, parent: null })
          fetchData()
        }}
      />
    </div>
  )
}

export default MenuList
