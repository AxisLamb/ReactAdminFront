// src/services/sys/userService.js
import apiClient from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const userService = {
  /**
   * Fetch paginated user list
   * @param {Object} params - Pagination parameters
   * @param {number} params.pageNo - Page number (starting from 1)
   * @param {number} params.pageSize - Number of items per page
   * @returns {Promise<Object>} Paginated user data
   */
  async getUsers(params = {}) {
    const response = await apiClient.get(`${API_BASE_URL}/sys/user/page`, {
      params: {
        current: params.pageNo || 1,
        size: params.pageSize || 10,
        ...params
      }
    });
    return response.data;
  },

  /**
   * Save user (create or update)
   * @param {Object} userData - User data to save
   * @returns {Promise<Object>} Saved user data
   */
  async saveUser(userData) {
    if (userData.userId) {
      // Update existing user
      const response = await apiClient.post(`${API_BASE_URL}/sys/user/update`, userData);
      return response.data;
    } else {
      // Create new user
      const response = await apiClient.post(`${API_BASE_URL}/sys/user/save`, userData);
      return response.data;
    }
  },

  /**
   * Delete user by ID
   * @param {string|number} userId - ID of user to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUsers(userIds) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/user/delete`, userIds);
    return response.data;
  },

  /**
   * Delete user by ID
   * @param {string|number} userId - ID of user to delete
   * @returns {Promise<Object>} Deletion result
   */
  async getUserInfo() {
    const response = await apiClient.get(`${API_BASE_URL}/sys/user/info`);
    return response.data;
  },

  /**
   * Get all roles
   * @returns {Promise<Array>} List of roles
   */
  async getRoles() {
    const response = await apiClient.get(`${API_BASE_URL}/sys/role/roles`);
    return response.data;
  }
};