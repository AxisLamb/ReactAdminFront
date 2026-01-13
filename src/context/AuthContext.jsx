// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../service/authService';
import { menuService } from '../service/menuService';
import { userService } from '../service/userService';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const initAuth = async (tokenParam) => {
      // Check if token exists in localStorage on initial load
    const storedToken = localStorage.getItem('satoken');
    if (storedToken || tokenParam) {
      setToken(storedToken ? storedToken : tokenParam);
      setIsLoggedIn(true);
      try {
        // Usage
        const allMenus = await menuService.getMenus();
        const userInfo = await userService.getUserInfo();
        
        // Filter menus based on user role
        // If role has menu_ids, filter them.
        const roleMenuIds = userInfo.role ? userInfo.role.menuIds : [];
        const userMenus = allMenus.filter(m => roleMenuIds.includes(m.menuId));
        
        setUser({ ...userInfo, permissions: userMenus.map(m => m.perms) });
        setMenus(userMenus);
      } catch (error) {
        console.error(error);
        logout();
      }
    }
    setLoading(false);
  };
  
  useEffect(() => {
    setTimeout(() => { // Simulate a delay for loading
      initAuth();
    }, 200);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.code === 0) { // Success
        const token = response.data;
        localStorage.setItem('satoken', token);
        setToken(token);
        setIsLoggedIn(true);
        initAuth(token);
        return { success: true, token: token };
      } else {
        console.error('Login failed:', response.msg);
        return { success: false, message: response.msg };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  };
  const logout = async () => {
    // Call backend logout API and wait for response
    const logoutSuccess = await authService.logout();
    
    // Only proceed with cleanup if logout was successful
    if (logoutSuccess) {
      localStorage.removeItem('satoken');
      setToken(null);
      setIsLoggedIn(false);
      setUser(null);
      setMenus([]);
    } else {
      console.error('Logout API call failed');
    }
  };

  const value = {
    isLoggedIn,
    token,
    login,
    logout,
    user,
    menus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};