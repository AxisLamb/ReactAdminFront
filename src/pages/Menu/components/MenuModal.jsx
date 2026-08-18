import { useEffect, useMemo, useState } from 'react'
import {
  App,
  AutoComplete,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  TreeSelect,
} from 'antd'
import PropTypes from 'prop-types'
import IconSelect from '../../../components/IconSelect'
import { addMenu, getMenuListAll, updateMenu } from '../../../api/menu'
import { listToTree } from '../../../utils/helpers'
import { componentRegistry } from '../../../routes'

/** 组件名称下拉候选（来自路由注册表） */
const componentOptions = Object.keys(componentRegistry).map((name) => ({ value: name }))

/**
 * 递归剔除指定节点（含其后代），避免编辑时把自身或子级选为父级形成环
 */
const excludeNode = (nodes, targetId) =>
  (nodes || [])
    .filter((n) => n.menuId !== targetId)
    .map((n) => ({ ...n, children: n.children ? excludeNode(n.children, targetId) : undefined }))

/**
 * 菜单新增 / 编辑弹窗
 * - 父级菜单：TreeSelect（按钮类型不可作父级；编辑时排除自身子树）
 * - 类型联动：目录显示 URL/图标；菜单追加组件名称/权限标识；按钮仅名称/权限标识；
 *   接口目录/业务/接口（3/4/5）为接口权限相关类型，展示 URL/图标/权限标识
 * - 图标选择：IconSelect 弹层网格选择
 */
const MenuModal = ({ open, record, parent, onCancel, onSuccess }) => {
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const isEdit = !!record
  const menuType = Form.useWatch('type', form)

  const [confirmLoading, setConfirmLoading] = useState(false)
  const [menuTree, setMenuTree] = useState([])

  useEffect(() => {
    if (!open) return
    form.resetFields()
    if (record) {
      form.setFieldsValue({
        parentId: record.parentId ?? 0,
        type: record.type,
        name: record.name,
        url: record.url,
        reactComponent: record.reactComponent,
        perms: record.perms,
        icon: record.icon,
        orderNum: record.orderNum ?? 0,
      })
    } else {
      form.setFieldsValue({
        parentId: parent?.menuId ?? 0,
        type: parent ? 1 : 0,
        orderNum: 0,
      })
    }

    getMenuListAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        // 后端返回扁平列表（含 parentId），转为树形结构供 TreeSelect 展示
        setMenuTree(list.length && !list[0].children ? listToTree(list) : list)
      })
      .catch((e) => console.error('[MenuModal] load menu tree error:', e))
  }, [open, record, parent, form])

  /** 父级候选树：过滤按钮节点；编辑时剔除自身子树 */
  const parentOptions = useMemo(() => {
    const toOptions = (nodes) =>
      (nodes || [])
        // 按钮（2）与接口（5）为末端节点，不可作父级
        .filter((n) => n.type !== 2 && n.type !== 5)
        .map((n) => ({
          value: n.menuId,
          title: n.name,
          children: n.children?.length ? toOptions(n.children) : undefined,
        }))
    const source = isEdit ? excludeNode(menuTree, record.menuId) : menuTree
    return [{ value: 0, title: '顶级菜单' }, ...toOptions(source)]
  }, [menuTree, isEdit, record])

  /** 切换类型时清空不适用字段，避免残留脏数据提交 */
  const handleTypeChange = (e) => {
    const type = e.target.value
    if (type === 2) {
      form.setFieldsValue({ url: undefined, reactComponent: undefined, icon: undefined })
    } else if (type === 0) {
      form.setFieldsValue({ reactComponent: undefined, perms: undefined })
    }
  }

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        setConfirmLoading(true)
        const payload = {
          parentId: values.parentId ?? 0,
          name: values.name.trim(),
          type: values.type,
          orderNum: values.orderNum ?? 0,
          url: values.type !== 2 ? values.url?.trim() || undefined : undefined,
          reactComponent:
            values.type === 1 ? values.reactComponent?.trim() || undefined : undefined,
          perms: values.type !== 0 ? values.perms?.trim() || undefined : undefined,
          icon: values.type !== 2 ? values.icon || undefined : undefined,
        }
        const request = isEdit
          ? updateMenu({ menuId: record.menuId, ...payload })
          : addMenu(payload)
        request
          .then(() => {
            message.success(isEdit ? '保存成功' : '新增成功')
            onSuccess()
          })
          .catch((e) => console.error('[MenuModal] submit error:', e))
          .finally(() => setConfirmLoading(false))
      })
      .catch(() => {})
  }

  return (
    <Modal
      title={isEdit ? '编辑菜单' : parent ? `新增子级 · ${parent.name}` : '新增菜单'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="保存"
      cancelText="取消"
      width={640}
      maskClosable={false}
      destroyOnHidden
    >
      <Form
        form={form}
        className="modal-form"
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ type: 1, parentId: 0, orderNum: 0 }}
        style={{ maxWidth: 560, margin: '20px auto 4px' }}
        autoComplete="off"
      >
        <Form.Item label="父级菜单" name="parentId">
          <TreeSelect
            treeData={parentOptions}
            treeDefaultExpandAll
            showSearch
            treeNodeFilterProp="title"
            placeholder="请选择父级菜单"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="菜单类型" name="type" rules={[{ required: true }]}>
          <Radio.Group onChange={handleTypeChange} optionType="button" buttonStyle="solid">
            <Radio value={0}>目录</Radio>
            <Radio value={1}>菜单</Radio>
            <Radio value={2}>按钮</Radio>
            <Radio value={3}>接口目录</Radio>
            <Radio value={4}>业务</Radio>
            <Radio value={5}>接口</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="菜单名称"
          name="name"
          rules={[
            { required: true, whitespace: true, message: '请输入菜单名称' },
            { max: 50, message: '菜单名称不能超过 50 个字符' },
          ]}
        >
          <Input placeholder="如：系统管理、用户管理" allowClear />
        </Form.Item>

        {menuType !== 2 && (
          <Form.Item
            label="菜单 URL"
            name="url"
            rules={[
              { required: menuType === 1, message: '请输入菜单 URL' },
              { pattern: /^[A-Za-z0-9/_-]+$/, message: '仅支持字母、数字、/、_、-' },
            ]}
            extra="目录作为路由前缀（如 sys），菜单为具体页面路径（如 sys/user）"
          >
            <Input placeholder="如：sys/user" allowClear />
          </Form.Item>
        )}

        {menuType === 1 && (
          <Form.Item
            label="组件名称"
            name="reactComponent"
            extra="需与前端路由注册表中的组件 key 一致，否则将降级为 404"
          >
            <AutoComplete
              options={componentOptions}
              placeholder="如：UserList"
              allowClear
              filterOption={(input, option) =>
                option.value.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        )}

        {menuType !== 0 && (
          <Form.Item
            label="权限标识"
            name="perms"
            rules={[
              { required: menuType === 2, message: '请输入权限标识' },
              { pattern: /^[A-Za-z0-9:_-]+$/, message: '如 sys:user:list，支持字母数字与 : _ -' },
            ]}
          >
            <Input placeholder="如：sys:user:list" allowClear />
          </Form.Item>
        )}

        {menuType !== 2 && (
          <Form.Item label="菜单图标" name="icon">
            <IconSelect />
          </Form.Item>
        )}

        <Form.Item label="排序号" name="orderNum">
          <InputNumber min={0} max={9999} precision={0} style={{ width: 140 }} />
        </Form.Item>
      </Form>
    </Modal>
  )
}

MenuModal.propTypes = {
  open: PropTypes.bool.isRequired,
  /** 编辑时的菜单记录 */
  record: PropTypes.object,
  /** 新增子级时的父级菜单记录 */
  parent: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default MenuModal
