import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

    // Clear satoken from localStorage when component mounts
  useEffect(() => {
    localStorage.removeItem('satoken');
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const loginResult = await login(values.username, values.password);
      if (loginResult && loginResult.success) {
        // 登录成功，跳转到仪表板
        navigate('/dashboard');
      } else {
        // 登录失败，显示错误信息
        message.error(loginResult.message);
      }
    } catch (error) {
      console.error('Login failed:', error);
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-title">Admin System Login</div>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your Username!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username (admin)" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password (password)"
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
          <div style={{textAlign: 'center', color: '#888'}}>
             Default: admin / password
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
