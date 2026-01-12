import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Tree, Tag, Select } from 'antd';  
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { menuService } from '../../service/menuService';
import { roleService } from '../../service/roleService';
import showMessage from '../../utils/messageUtil';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [menuTree, setMenuTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 10,
    total: 0
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [roleResponse, treeData] = await Promise.all([
        roleService.getRolesPage({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize
        }),
        menuService.getMenuTree()
      ]);
      
      setRoles(roleResponse.records || roleResponse.data?.records || []);
      setMenuTree(treeData);
      setPagination(prev => ({
        ...prev,
        total: roleResponse.total || roleResponse.data?.total || 0
      }));
    } catch (error) {
      showMessage('Failed to load data', 'error', 3);
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [pagination.pageNo, pagination.pageSize]);

  const handleTableChange = (pager) => {
    setPagination(prev => ({
      ...prev,
      pageNo: pager.current,
      pageSize: pager.pageSize
    }));
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setCheckedKeys([]);
    setIsModalVisible(true);
  };

  // const handleEdit = (record) => {
  //   setEditingId(record.roleId);
  //   form.setFieldsValue(record);
    
  //   // Handle menuIds properly - convert to string array for Tree component
  //   const menuIds = record.menuIds || [];
  //   setCheckedKeys(menuIds);
  //   setIsModalVisible(true);
  // };

   const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this role? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await roleService.deleteRole(id);
          showMessage('Deleted successfully', 'success', 3);
          loadData();
        } catch (e) {
          showMessage('Delete failed', 'error', 3);
          console.error('Error deleting role:', e);
        }
      }
    });
  };


  const handleEdit = (record) => {
    setEditingId(record.roleId);
    form.setFieldsValue(record);
    
    // 获取叶子节点ID进行回显，避免选中父级菜单
    const leafMenuIds = getLeafMenuIds(record.menuIds || [], menuTree);
    setCheckedKeys(leafMenuIds);
    setIsModalVisible(true);
  };



  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 在保存前，根据选中的叶子节点重新计算完整的菜单路径
      const fullMenuIds = calculateFullMenuIds(checkedKeys, menuTree);
      
      if (editingId) {
        // 更新角色
        await roleService.updateRole({ 
          ...values, 
          roleId: editingId,
          menuIds: fullMenuIds
        });
        showMessage('Updated successfully', 'success', 3);
      } else {
        // 新增角色
        await roleService.saveRole({ 
          ...values, 
          menuIds: fullMenuIds
        });
        showMessage('Saved successfully', 'success', 3);
      }
      setIsModalVisible(false);
      loadData();
    } catch (e) {
      console.error('Error saving role:', e);
      showMessage('Save failed', 'error', 3);
    }
  };

  // 计算包含父级菜单的完整ID列表
  const calculateFullMenuIds = (leafIds, treeData) => {
    const allIds = new Set();
    
    // 递归查找叶子节点并添加其所有父级
    const findAndAddParentPath = (nodes, targetId, path = []) => {
      for (const node of nodes) {
        const currentPath = [...path, node.menuId];
        
        if (node.menuId === targetId) {
          // 找到目标叶子节点，添加完整路径
          currentPath.forEach(id => allIds.add(id));
          return true;
        }
        
        if (node.children && node.children.length > 0) {
          if (findAndAddParentPath(node.children, targetId, currentPath)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // 对每个选中的叶子节点都执行路径查找
    leafIds.forEach(leafId => {
      findAndAddParentPath(treeData, leafId, []);
    });
    
    return Array.from(allIds).map(Number);
  };

  // 从菜单树中提取叶子节点ID
  const getLeafMenuIds = (selectedIds, treeData) => {
    const leafIds = [];
    
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          // 如果当前节点有子节点，继续递归
          traverse(node.children);
        } else {
          // 如果是叶子节点且在选中的ID中，则添加到结果中
          if (selectedIds.includes(node.menuId)) {
            leafIds.push(node.menuId);
          }
        }
      });
    };
    
    traverse(treeData);
    return leafIds;
  };

  const handleSelectAll = () => {
    const getAllLeafKeys = (treeNodes) => {
      const keys = [];
      const traverse = (nodes) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            traverse(node.children);
          } else {
            keys.push(node.menuId);
          }
        });
      };
      traverse(treeNodes);
      return keys;
    };
    
    const allLeafKeys = getAllLeafKeys(menuTree);
    setCheckedKeys(allLeafKeys);
  };

  const handleClearAll = () => {
    setCheckedKeys([]);
  };

  const columns = [
    { 
      title: 'Serial No.', 
      key: 'index', 
      render: (_, __, index) => (
        (pagination.pageNo - 1) * pagination.pageSize + index + 1
      ),
      width: 80
    },
    { title: 'Role Name', dataIndex: 'roleName', key: 'roleName' },
    { title: 'Description', dataIndex: 'roleDesc', key: 'roleDesc' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Active' : 'Disabled'}
        </Tag>
      )
    },
    { title: 'Create Time', dataIndex: 'createTime', key: 'createTime' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <Button icon={<DeleteOutlined />} type="link" danger onClick={() => handleDelete(record.roleId)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        Add Role
      </Button>
      <Table 
        columns={columns} 
        dataSource={roles} 
        rowKey="roleId" 
        loading={loading}
        pagination={{
          current: pagination.pageNo,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true
        }}
        onChange={handleTableChange}
      />

      <Modal 
        title={editingId ? "Edit Role" : "Add Role"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="roleName" label="Role Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleDesc" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue={1}>
            <Select>
              <Select.Option value={1}>Active</Select.Option>
              <Select.Option value={0}>Disabled</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Permissions">
            <div style={{ marginBottom: 8 }}>
              <Button 
                size="small" 
                onClick={handleSelectAll}
                style={{ marginRight: 8 }}
              >
                Select All
              </Button>
              <Button 
                size="small" 
                onClick={handleClearAll}
                danger
              >
                Clear All
              </Button>
            </div>
            <Tree
              checkable
              checkedKeys={checkedKeys}
              onCheck={(keys) => setCheckedKeys(keys)}
              treeData={menuTree}
              fieldNames={{ title: 'name', key: 'menuId', children: 'children' }}
              height={250}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoleList;