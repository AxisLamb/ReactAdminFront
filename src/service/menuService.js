// src/services/sys/menuService.js
import apiClient from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const menuService = {

  /**
   * Fetch all menus
   * @returns {Promise<Array>} routes
   */
  async fetchRoutes() {
    const response = await apiClient.get(`${API_BASE_URL}/sys/menu/routes`);
    return response.data;
  },

  /**
   * Fetch all menus
   * @returns {Promise<Array>} List of menus
   */
  async getMenus() {
    const response = await apiClient.get(`${API_BASE_URL}/sys/menu/list`);
    return response.data;
  },

  /**
   * Fetch all menus
   * @returns {Promise<Array>} List of menus
   */
  async getMenuTree() {
    const response = await apiClient.get(`${API_BASE_URL}/sys/menu/listAll`);
    const buildTree = (items, parentId = 0) => {
      return items
        .filter(item => item.parentId === parentId)
        .map(item => ({
          ...item,
          key: item.menuId,
          title: item.name,
          children: buildTree(items, item.menuId)
        }));
    };
    return buildTree(response.data);
  },

  /**
   * Add a new menu
   * @param {Object} menuData - Menu data to add
   * @returns {Promise<Object>} Response from the server
   */
  async addMenu(menuData) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/menu/add`, menuData);
    return response.data;
  },

  /**
   * Update an existing menu
   * @param {Object} menuData - Menu data to update
   * @returns {Promise<Object>} Response from the server
   */
  async updateMenu(menuData) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/menu/update`, menuData);
    return response.data;
  },

  /**
   * Delete a menu by ID
   * @param {number} menuId - ID of the menu to delete
   * @returns {Promise<Object>} Response from the server
   */
  async deleteMenu(menuId) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/menu/delete/${menuId}`);
    return response.data;
  }
};