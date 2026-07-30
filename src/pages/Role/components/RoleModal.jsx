import { useEffect, useMemo, useState } from 'react'
import { App, Button, Empty, Form, Input, Modal, Space, Spin, Switch, Tree } from 'antd'
import { ApartmentOutlined, NodeExpandOutlined, ShrinkOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types'
import { addRole, updateRole } from '../../../api/role'
import { getMenuListAll } from '../../../api/menu'
import { collectTreeKeys, traverseTree } from '../../../utils/helpers'

/**
 * 从菜单树中筛出叶子节点 id（用于编辑回显）
 * 父子联动模式下仅勾选叶子，父级勾选态由 Tree 自动推导，
 * 避免"部分子节点被选中时父节点被强制全选"的问题
 */
const pickLeafKeys = (tree, ids) => {
  const idSet = new Set((ids || []).map(Number))
  const leaves = []
  traverseTree(tree, (node) => {
    const isLeaf = !node.children || node.children.length === 0
    if (isLeaf && idSet.has(node.menuId)) leaves.push(node.menuId)
  })
  return leaves
}

/**
 * 角色新增 / 编辑弹窗
 * - 基本信息：角色名称（必填）/ 角色描述 / 状态开关
 * - 菜单权限：Tree 勾选（父子联动），编辑时按 menuIds 回显
 * - 提交时 menuIds = 全勾选节点 + 半选父节点
 */
const RoleModal = ({ open, record, onCancel, onSuccess }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const isEdit = !!record

  const [confirmLoading, setConfirmLoading] = useState(false)
  const [treeLoading, setTreeLoading] = useState(false)
  const [menuTree, setMenuTree] = useState([])
  const [expandedKeys, setExpandedKeys] = useState([])
  const [checkedKeys, setCheckedKeys] = useState([])
  const [halfCheckedKeys, setHalfCheckedKeys] = useState([])

  /** 全部菜单节点 key（展开/折叠全部用） */
  const allKeys = useMemo(() => collectTreeKeys(menuTree, 'menuId'), [menuTree])

  useEffect(() => {
    if (!open) return
    form.resetFields()
    setCheckedKeys([])
    setHalfCheckedKeys([])
    if (record) {
      form.setFieldsValue({
        roleName: record.roleName,
        roleDesc: record.roleDesc,
        status: record.status === 1,
      })
    }

    // 加载全量菜单树并回显权限
    setTreeLoading(true)
    getMenuListAll()
      .then((tree) => {
        const data = Array.isArray(tree) ? tree : []
        setMenuTree(data)
        setExpandedKeys(collectTreeKeys(data, 'menuId'))
        if (record) setCheckedKeys(pickLeafKeys(data, record.menuIds))
      })
      .catch((e) => console.error('[RoleModal] load menu tree error:', e))
      .finally(() => setTreeLoading(false))
  }, [open, record, form])

  const handleCheck = (keys, info) => {
    setCheckedKeys(keys)
    setHalfCheckedKeys(info.halfCheckedKeys || [])
  }

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setConfirmLoading(true)
        const payload = {
          roleName: values.roleName.trim(),
          roleDesc: values.roleDesc?.trim(),
          status: values.status ? 1 : 0,
          // 半选父节点同样属于已分配权限，需一并提交
          menuIds: [...checkedKeys, ...halfCheckedKeys],
        }
        const request = isEdit
          ? updateRole({ roleId: record.roleId, ...payload })
          : addRole(payload)
        request
          .then(() => {
            message.success(isEdit ? '保存成功' : '新增成功')
            onSuccess()
          })
          .catch((e) => console.error('[RoleModal] submit error:', e))
          .finally(() => setConfirmLoading(false))
      })
      .catch(() => {})
  }

  const checkedTotal = checkedKeys.length + halfCheckedKeys.length

  return (
    <Modal
      title={isEdit ? '编辑角色' : '新增角色'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="保存"
      cancelText="取消"
      width={620}
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        className="modal-form"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ status: true }}
        style={{ maxWidth: 540, margin: '20px auto 4px' }}
        autoComplete="off"
      >
        <Form.Item
          label="角色名称"
          name="roleName"
          rules={[
            { required: true, whitespace: true, message: '请输入角色名称' },
            { max: 50, message: '角色名称不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="如：部门经理、运营专员" allowClear />
        </Form.Item>

        <Form.Item
          label="角色描述"
          name="roleDesc"
          rules={[{ max: 200, message: '角色描述不能超过 200 个字符' }]}
        >
          <Input.TextArea placeholder="简要说明该角色的职责范围" rows={2} allowClear />
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="正常" unCheckedChildren="禁用" />
        </Form.Item>

        <Form.Item label="菜单权限" required style={{ marginBottom: 8 }}>
          <div className="perm-tree-toolbar">
            <Space size={4}>
              <Button
                size="small"
                icon={<NodeExpandOutlined />}
                onClick={() => setExpandedKeys(allKeys)}
              >
                展开全部
              </Button>
              <Button size="small" icon={<ShrinkOutlined />} onClick={() => setExpandedKeys([])}>
                折叠全部
              </Button>
            </Space>
            <span className="perm-tree-count">
              已选 <b>{checkedTotal}</b> 项权限
            </span>
          </div>
          <div className="perm-tree-box">
            <Spin spinning={treeLoading}>
              {menuTree.length ? (
                <Tree
                  checkable
                  treeData={menuTree}
                  fieldNames={{ title: 'name', key: 'menuId', children: 'children' }}
                  checkedKeys={checkedKeys}
                  onCheck={handleCheck}
                  expandedKeys={expandedKeys}
                  onExpand={(keys) => setExpandedKeys(keys)}
                />
              ) : (
                !treeLoading && (
                  <Empty
                    className="perm-tree-empty"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无菜单数据"
                  />
                )
              )}
            </Spin>
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <ApartmentOutlined style={{ marginRight: 4 }} />
            勾选父节点将联动选中全部子节点，半选状态的父节点也会纳入权限范围
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}

RoleModal.propTypes = {
  open: PropTypes.bool.isRequired,
  record: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default RoleModal
