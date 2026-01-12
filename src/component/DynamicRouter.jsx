// src/hooks/useDynamicRoutes.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { menuService } from '../service/menuService';

export const useDynamicRoutes = () => {
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get auth state from context
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const loadRoutes = async () => {
      // Wait for auth to be initialized and check if user is logged in
      if (isLoggedIn) {
        try {
          const routeData = await menuService.fetchRoutes();
          setRoutes(routeData);
        } catch (error) {
          console.error('Failed to load routes:', error);
          setRoutes(getDefaultRoutes());
        }
      } else {
        // If not authenticated or still loading auth state, return default routes
        setRoutes(getDefaultRoutes());
      }
      
      setLoading(false);
    };

    loadRoutes();
  }, [isLoggedIn]);

  return { routes, loading };
};

// Default routes as fallback
const getDefaultRoutes = () => [
  {
    path: '/login',
    element: 'Login',
    exact: true
  },
  {
    path: '/',
    element: 'MainLayout',
    protected: true,
    children: [
      {
        path: 'dashboard',
        element: 'Dashboard'
      }
    ]
  }
];