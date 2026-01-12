import React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Dashboard = () => {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status and redirect if not logged in
  React.useEffect(() => {
    if (!loading && !isLoggedIn) {
      // Redirect to login page with return URL
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoggedIn, loading, navigate, location]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        Loading...
      </div>
    );
  }

  // Don't render content if not logged in (redirect will happen via effect)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Dashboard</h2>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Roles"
              value={5}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={93423}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="New Orders"
              value={42}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: 24 }}>
        <Card title="System Information">
           <p>Welcome to the RBAC Management System Demo.</p>
           <p>This system demonstrates a classic Admin dashboard with simulated backend.</p>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;