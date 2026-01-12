// src/pages/system/UserList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userService } from '../../service/userService'; // Import the new service
import { roleService } from '../../service/roleService'; // Import the new service
import showMessage from '../../utils/messageUtil'; // Import the default export
import { usePermission } from '../../utils/permissionUtil'; // Import permission hook

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 10,
    total: 0
  });

  // Get permission checking functions
  const { hasPermission, hasAnyPermission } = usePermission();

  const loadData = async () => {
    setLoading(true);
    try {
      const [userResponse, roleList] = await Promise.all([
        userService.getUsers({
          pageNo: pagination.pageNo,
          pageSize: pagination.pageSize
        }),
        roleService.getRoles()
      ]);
      
      setUsers(userResponse.records || userResponse.data || []);
      setRoles(roleList);
      setPagination(prev => ({
        ...prev,
        total: userResponse.total || 0
      }));
    } catch (error) {
       // Use global message API with custom duration
      showMessage('Failed to load data', 3); // 3 seconds duration
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
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.userId);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this user? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await userService.deleteUsers([id]);
          showMessage('Deleted successfully', 'success', 3);
          loadData();
        } catch (e) {
          showMessage('Delete failed', 'error', 3);
          console.error('Error deleting user:', e);
        }
      }
    });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await userService.saveUser({ ...values, userId: editingId });
      showMessage('Saved successfully', 3); // 3 seconds duration
      setIsModalVisible(false);
      loadData();
    } catch (e) {
      console.error('Error saving user:', e);
      showMessage('Save failed', 3); // 3 seconds duration
    }
  };

  // Define permission codes
  const PERMISSIONS = {
    ADD: 'sys:user:save',
    EDIT: 'sys:user:update',
    DELETE: 'sys:user:delete'
  };

  // Update the columns definition to conditionally include the Action column
  const columns = [
    { 
      title: 'Serial No.', 
      key: 'index', 
      render: (_, __, index) => (
        (pagination.pageNo - 1) * pagination.pageSize + index + 1
      ),
      width: 80
    },
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Real Name', dataIndex: 'realName', key: 'realName' },
    { title: 'Role', dataIndex: 'roleName', key: 'roleName', render: (text) => <Tag color="blue">{text}</Tag> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 1 ? 'green' : 'red'}>{s === 1 ? 'Active' : 'Disabled'}</Tag> },
  ];

  // Conditionally add the Action column only if user has edit or delete permissions
  if (hasPermission(PERMISSIONS.EDIT) || hasPermission(PERMISSIONS.DELETE)) {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* Only show edit button if user has edit permission */}
          {hasPermission(PERMISSIONS.EDIT) && (
            <Button 
              icon={<EditOutlined />} 
              type="link" 
              onClick={() => handleEdit(record)}
            >
              Edit
            </Button>
          )}
          
          {/* Only show delete button if user has delete permission */}
          {hasPermission(PERMISSIONS.DELETE) && (
            <Button 
              icon={<DeleteOutlined />} 
              type="link" 
              danger 
              onClick={() => handleDelete(record.userId)}
            >
              Delete
            </Button>
          )}
        </Space>
      ),
    });
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        {/* Only show add button if user has add permission */}
        {hasPermission(PERMISSIONS.ADD) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add User
          </Button>
        )}
      </div>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="userId" 
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
        title={editingId ? "Edit User" : "Add User"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input disabled={!!editingId} />
          </Form.Item>
          {!editingId && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item name="realName" label="Real Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roleId" label="Role" rules={[{ required: true }]}>
            <Select>
              {roles.map(r => (
                <Select.Option key={r.roleId} value={r.roleId}>{r.roleName}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue={1}>
            <Select>
              <Select.Option value={1}>Active</Select.Option>
              <Select.Option value={0}>Disabled</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserList;