import React, { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  SettingOutlined,
  TeamOutlined,
  MenuOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;

// Map icon strings to components
const iconMap = {
  DashboardOutlined: <DashboardOutlined />,
  SettingOutlined: <SettingOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  MenuOutlined: <MenuOutlined />,
};

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, menus, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Convert flat menu list to AntD menu structure
  const getMenuItems = (items, parentId = 0) => {
    return items
      .filter((item) => item.parentId === parentId && item.type !== 2) // Filter buttons
      .map((item) => {
        const children = getMenuItems(items, item.menuId);
        return {
          key: item.url,
          icon: iconMap[item.icon] || <MenuOutlined />,
          label: item.name,
          children: children.length > 0 ? children : undefined,
          onClick: children.length === 0 ? () => navigate(item.url) : undefined,
        };
      })
      .sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
  };

  const menuItems = getMenuItems(menus);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="layout-logo">
           {collapsed ? 'Sys' : 'Admin System'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: 'trigger',
            onClick: () => setCollapsed(!collapsed),
            style: { fontSize: '18px', cursor: 'pointer' }
          })}
          
          <Space>
            <span style={{ marginRight: 8 }}>Welcome, {user?.realName}</span>
            <Dropdown menu={userMenu}>
              <Avatar style={{ backgroundColor: '#87d068', cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
