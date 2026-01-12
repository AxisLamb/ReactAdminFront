import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Radio, InputNumber, Tree, Row, Col, Popconfirm } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  // 常用图标
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  TeamOutlined,
  ToolOutlined,
  HomeOutlined,
  MenuOutlined,
  UsergroupAddOutlined,
  KeyOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { menuService } from '../../service/menuService';
import showMessage from '../../utils/messageUtil';

const MenuList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(0); // 默认根节点
  const [treeData, setTreeData] = useState([]);
  const [treeExpandedKeys, setTreeExpandedKeys] = useState([]);
  const [showTreeSelection, setShowTreeSelection] = useState(false);
  const [selectedNodeName, setSelectedNodeName] = useState(''); // 新增：选中节点名称
  const [showIconSelector, setShowIconSelector] = useState(false); // 控制图标选择器显示
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Track selected row keys
  const [isEditMode, setIsEditMode] = useState(false); // 区分编辑和新增模式

    // 常用图标列表
  const commonIcons = [
    { name: 'UserOutlined', component: <UserOutlined /> },
    { name: 'DashboardOutlined', component: <DashboardOutlined /> },
    { name: 'SettingOutlined', component: <SettingOutlined /> },
    { name: 'AppstoreOutlined', component: <AppstoreOutlined /> },
    { name: 'FileTextOutlined', component: <FileTextOutlined /> },
    { name: 'TeamOutlined', component: <TeamOutlined /> },
    { name: 'ToolOutlined', component: <ToolOutlined /> },
    { name: 'HomeOutlined', component: <HomeOutlined /> },
    { name: 'MenuOutlined', component: <MenuOutlined /> },
    { name: 'UsergroupAddOutlined', component: <UsergroupAddOutlined /> },
    { name: 'KeyOutlined', component: <KeyOutlined /> },
    { name: 'LockOutlined', component: <LockOutlined /> },
    { name: 'EyeOutlined', component: <EyeOutlined /> },
    { name: 'EyeInvisibleOutlined', component: <EyeInvisibleOutlined /> },
    { name: 'SearchOutlined', component: <SearchOutlined /> },
    { name: 'FilterOutlined', component: <FilterOutlined /> },
    { name: 'ExportOutlined', component: <ExportOutlined /> },
    { name: 'ImportOutlined', component: <ImportOutlined /> },
    { name: 'DownloadOutlined', component: <DownloadOutlined /> },
    { name: 'UploadOutlined', component: <UploadOutlined /> },
  ];

  const loadData = async () => {
    setLoading(true);
    const tree = await menuService.getMenuTree();
    setData(tree);
    // 过滤树数据，只保留前两级
    const filteredTreeData = filterTreeDataToTwoLevels(tree);
    setTreeData(filteredTreeData);
    setLoading(false);
  };

    // 过滤树数据，只保留前两级
  const filterTreeDataToTwoLevels = (treeData, currentLevel = 0) => {
    if (currentLevel >= 2) {
      return []; // 超过二级的节点不显示
    }
    
    return treeData.map(node => {
      const filteredNode = { ...node };
      if (node.children && node.children.length > 0) {
        filteredNode.children = filterTreeDataToTwoLevels(node.children, currentLevel + 1);
      }
      return filteredNode;
    });
  };


  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    setSelectedParentId(0); // 默认根节点
    setSelectedNodeName(''); // 清空选中节点名称
    setShowTreeSelection(true); // 显示树选择器
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setEditingId(record.menuId);
    // 设置父节点ID
    setSelectedParentId(record.parentId);

    // 回显数据到表单
    form.setFieldsValue({
      ...record,
      type: record.type,
      name: record.name,
      url: record.url,
      perms: record.perms,
      icon: record.icon,
      orderNum: record.orderNum,
      parentId: record.parentId
    });
    
    // 设置选中的节点名称
    const findNodeName = (nodes, targetId) => {
      for (const node of nodes) {
        if (node.key === targetId) {
          return node.name || node.title;
        }
        if (node.children && node.children.length > 0) {
          const name = findNodeName(node.children, targetId);
          if (name) return name;
        }
      }
      return null;
    };
    
    const nodeName = findNodeName(treeData, record.parentId);
    if (nodeName) {
      setSelectedNodeName(nodeName);
    } else {
      setSelectedNodeName(record.parentId === 0 ? '根节点' : '');
    }
    
    // 设置父节点ID和显示树选择器
    setShowTreeSelection(true); // 编辑时也显示树选择器以便修改父节点
    
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await menuService.deleteMenu(id);
    showMessage('Deleted', 'success', 3);
    loadData();
  };

  // 确认删除函数
  const confirmDelete = (id) => {
    handleDelete(id);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 在提交数据时，使用选中的父节点ID
      const menuData = {
        ...values,
        parentId: selectedParentId || 0
      };
      
      if (editingId) {
        // 更新现有菜单
        await menuService.updateMenu({ ...menuData, menuId: editingId });
      } else {
        // 添加新菜单
        await menuService.addMenu(menuData);
      }
      
      // 检查响应状态（根据后端返回格式调整）
      showMessage(editingId ? 'Updated' : 'Added', 'success', 3)
      setShowTreeSelection(false);
      setIsEditMode(false);
      loadData();
      setIsModalVisible(false);
    } catch (e) {
      console.error('Form validation or submission error:', e);
      showMessage('Form validation failed', 'error', 3)
    }
  };

  const handleTreeNodeSelect = (selectedKeys, info) => {
    if (selectedKeys.length > 0) {
      const selectedNodeId = Number(selectedKeys[0]);
      
      // 查找选中节点的层级
      const findNodeLevel = (nodes, targetId, currentLevel = 0) => {
        for (const node of nodes) {
          if (node.key === targetId) {
            return currentLevel;
          }
          if (node.children && node.children.length > 0) {
            const level = findNodeLevel(node.children, targetId, currentLevel + 1);
            if (level !== -1) return level;
          }
        }
        return -1;
      };
      
      const nodeLevel = findNodeLevel(treeData, selectedNodeId);

      // 检查层级，如果超过2级（即存在第3级及以上的节点）则不允许选择
      if (nodeLevel >= 2) {
        showMessage('不能在三级节点下添加节点', 'error', 3)
        return;
      }
      
      setSelectedParentId(selectedNodeId);

       // 获取选中节点的名称
      const findNodeName = (nodes, targetId) => {
        for (const node of nodes) {
          if (node.key === targetId) {
            return node.name || node.title;
          }
          if (node.children && node.children.length > 0) {
            const name = findNodeName(node.children, targetId);
            if (name) return name;
          }
        }
        return null;
      };
      
      const nodeName = findNodeName(treeData, selectedNodeId);
      if (nodeName) {
        setSelectedNodeName(nodeName);
      }
      
      // 根据节点层级自动设置类型
      let autoType = 1; // 默认为菜单
      if (nodeLevel === 0) {
        // 一级节点 - 类型设为菜单
        autoType = 1;
        form.setFieldsValue({ 
          parentId: selectedNodeId,
          type: autoType 
        });
      } else if (nodeLevel === 1) {
        // 二级节点 - 类型设为按钮
        autoType = 2;
        form.setFieldsValue({ 
          parentId: selectedNodeId,
          type: autoType 
        });
      } 
    }
  };
  
  // 监听表单类型字段的变化
  const onTypeChange = (value) => {
    if (value === 0) { // 如果选择 Catalog 类型
      form.setFieldsValue({ 
        parentId: 0 
      });
      setSelectedParentId(0);
      setSelectedNodeName('根节点'); // 当选择 Catalog 时，显示根节点
    }
  };

  // 选择图标
  const handleIconSelect = (iconName) => {
    form.setFieldsValue({ icon: iconName });
    setShowIconSelector(false);
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { 
      title: 'Icon', 
      dataIndex: 'icon', 
      key: 'icon',
      render: (icon) => {
        // 根据图标名称动态渲染图标组件
        const iconComponent = commonIcons.find(i => i.name === icon)?.component;
        return iconComponent || null;
      }
    },
    { title: 'Order', dataIndex: 'orderNum', key: 'orderNum' },
    { title: 'Permission', dataIndex: 'perms', key: 'perms' },
    { title: 'Url', dataIndex: 'url', key: 'url' },
    { title: 'Type', dataIndex: 'type', key: 'type', render: t => t === 0 ? 'Catalog' : t === 1 ? 'Menu' : 'Button' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} type="link" onClick={() => handleEdit(record)}>Edit</Button>
           <Popconfirm
            title="Confirm Delete"
            description="Are you sure you want to delete this menu?"
            onConfirm={() => confirmDelete(record.menuId)}
            okText="Yes"
            cancelText="Cancel"
          >
            <Button icon={<DeleteOutlined />} type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys) => {
      setSelectedRowKeys(selectedKeys);
    },
    type: 'checkbox', // or 'radio' if you want single selection
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: 16 }}>
        Add Menu
      </Button>

      {data && (
          <Table 
          // rowSelection={rowSelection}
          columns={columns} 
          dataSource={data} 
          rowKey="menuId" 
          loading={loading} 
          pagination={false} 
        />
      )}

      <Modal 
        title={editingId ? "Edit Menu" : "Add Menu"} 
        open={isModalVisible} 
        onOk={handleOk} 
        onCancel={() => {
          setIsModalVisible(false);
          setShowTreeSelection(false);
          setShowIconSelector(false);
          setIsEditMode(false);
        }}
        width={600}
      >
         <Form form={form} layout="vertical" onValuesChange={(changedValues) => {
            // 监听 type 字段变化
            if (changedValues.type !== undefined) {
              onTypeChange(changedValues.type);
            }
          }}>
          {showTreeSelection && selectedParentId >= 0 && treeData && (
            <Form.Item label="Select Parent Node">
              <Tree
                selectable={true}
                blockNode
                showLine
                defaultExpandAll
                onSelect={handleTreeNodeSelect}
                // defaultSelectedKeys={[selectedParentId]}
                selectedKeys={[selectedParentId]}
                treeData={treeData}
                fieldNames={{ title: 'name', key: 'key', children: 'children' }}
                switcherIcon={({ expanded }) => (
                  expanded ? 
                    <span style={{ color: '#1890ff', fontSize: '12px' }}>▼</span> : 
                    <span style={{ color: '#1890ff', fontSize: '12px' }}>▶</span>
                )}
              />
            </Form.Item>
          )}
          <Form.Item name="type" label="Type">
            <Radio.Group>
              <Radio value={0}>Catalog</Radio>
              <Radio value={1}>Menu</Radio>
              <Radio value={2}>Button</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {/* 显示选中的节点名称 - 仅展示，不参与表单提交 */}
          {selectedNodeName && (
            <Form.Item label="Selected Parent Node">
              <div style={{ 
                padding: '6px 12px', 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                backgroundColor: '#fafafa' 
              }}>
                {selectedNodeName}
              </div>
            </Form.Item>
          )}
          <Form.Item name="parentId" label="Parent ID" hidden={!showTreeSelection}>
            <InputNumber style={{ width: '100%' }} disabled />
          </Form.Item>
          <Form.Item name="url" label="URL">
            <Input />
          </Form.Item>
          <Form.Item name="perms" label="Permission Identifier">
            <Input />
          </Form.Item>
          <Form.Item name="icon" label="Icon">
            <Input 
              placeholder="Antd Icon Name (e.g. UserOutlined)" 
              onClick={() => setShowIconSelector(true)}
              suffix={form.getFieldValue('icon') ? 
                commonIcons.find(i => i.name === form.getFieldValue('icon'))?.component : null
              }
            />
          </Form.Item>
          
          {/* 图标选择器 */}
          {showIconSelector && (
            <Form.Item label="Select Icon">
              <div style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: '6px', 
                padding: '10px',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: '#fafafa'
              }}>
                <Row gutter={[8, 8]}>
                  {commonIcons.map((icon, index) => (
                    <Col span={4} key={index}>
                      <div 
                        style={{ 
                          textAlign: 'center', 
                          padding: '8px', 
                          cursor: 'pointer',
                          border: form.getFieldValue('icon') === icon.name ? '2px solid #1890ff' : '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: form.getFieldValue('icon') === icon.name ? '#e6f7ff' : '#fff'
                        }}
                        onClick={() => handleIconSelect(icon.name)}
                      >
                        <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                          {icon.component}
                        </div>
                        <div style={{ fontSize: '10px' }}>{icon.name}</div>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Form.Item>
          )}
          <Form.Item name="orderNum" label="Order">
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      <style jsx>{`
        .ant-tree li span.ant-tree-switcher.ant-tree-switcher_close::after {
          content: '▶';
          color: #1890ff;
        }
        .ant-tree li span.ant-tree-switcher.ant-tree-switcher_open::after {
          content: '▼';
          color: #1890ff;
        }
      `}</style>
    </>
  );
};

export default MenuList;