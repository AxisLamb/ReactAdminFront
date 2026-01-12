// src/App.jsx
import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setMessageApi } from './utils/messageUtil';
import './i18n/i18n';

// 静态导入组件
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './component/MainLayout';
import UserList from './pages/system/UserList';
import RoleList from './pages/system/RoleList';
import MenuList from './pages/system/MenuList';

// Import your route fetching logic
import { useDynamicRoutes } from './component/DynamicRouter';

// 静态组件映射
const componentMap = {
  Login,
  Dashboard,
  MainLayout,
  UserList,
  RoleList,
  MenuList
};

// Separate component for the router logic that has access to Auth context
const AppWithAuth = () => {
  const [router, setRouter] = useState(null);
  const { routes: dynamicRoutes, loading } = useDynamicRoutes();
  const [messageApi, contextHolder] = message.useMessage();

  React.useEffect(() => {
    setMessageApi(messageApi);
  }, [messageApi]);

  // Build router when routes are loaded
  useEffect(() => {
    if (dynamicRoutes) {
      const builtRoutes = [
        ...buildRoutes(dynamicRoutes),
        // Add catch-all route
        {
          path: '*',
          element: <Navigate to="/dashboard" replace />
        }
      ];
      
      const newRouter = createBrowserRouter(builtRoutes);
      setRouter(newRouter);
    }
  }, [dynamicRoutes]);

  if (loading || !router) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {contextHolder}
      <RouterProvider router={router} />
    </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Function to recursively convert route data to React Router format
const buildRoutes = (routeData) => {
  return routeData.map(route => {
    if (route.element) {
      // 使用静态映射
      const Component = componentMap[route.element];
      
      if (!Component) {
        console.error(`Component not found: ${route.element}`);
        return {
          path: route.path,
          element: <div>Component not found: {route.element}</div>
        };
      }

      const element = route.protected ? (
        <ProtectedRoute>
          <Component />
        </ProtectedRoute>
      ) : (
        <Component />
      );

      const finalRoute = {
        path: route.path,
        element: element,
        ...(route.exact && { exact: route.exact })
      };

      // Recursively build child routes if they exist
      if (route.children && route.children.length > 0) {
        finalRoute.children = buildRoutes(route.children);
      }

      return finalRoute;

    } else if (route.children && route.children.length > 0) {
      return {
        path: route.path,
        children: buildRoutes(route.children),
        ...(route.exact && { exact: route.exact })
      };
    } else {
      return {
        path: route.path,
        ...(route.exact && { exact: route.exact })
      };
    }
    
  });
};

const App = () => {
  return (
    <ConfigProvider>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;