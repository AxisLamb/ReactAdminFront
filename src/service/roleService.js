// src/services/sys/userService.js
import apiClient from '../utils/apiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const roleService = {
  /**
   * Fetch paginated user list
   * @param {Object} params - Pagination parameters
   * @param {number} params.pageNo - Page number (starting from 1)
   * @param {number} params.pageSize - Number of items per page
   * @returns {Promise<Object>} Paginated user data
   */
  async getRolesPage(params = {}) {
    const response = await apiClient.get(`${API_BASE_URL}/sys/role/page`, {
      params: {
        current: params.pageNo || 1,
        size: params.pageSize || 10,
        ...params
      }
    });
    return response.data;
  },

  /**
   * Get all roles
   * @returns {Promise<Array>} List of roles
   */
  async getRoles() {
    const response = await apiClient.get(`${API_BASE_URL}/sys/role/roles`);
    return response.data;
  },

  
  /**
   * Add a new role
   * @param {Object} roleData - Role data to add
   * @returns {Promise<Object>} Add result
   */
  async saveRole(roleData) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/role/add`, roleData);
    return response.data;
  },

  /**
   * Update an existing role
   * @param {Object} roleData - Role data to update
   * @returns {Promise<Object>} Update result
   */
  async updateRole(roleData) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/role/update`, roleData);
    return response.data;
  },

  /**
   * Delete role by ID
   * @param {string|number} roleId - ID of role to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRole(roleId) {
    const response = await apiClient.post(`${API_BASE_URL}/sys/role/delete`, null, {
      params: {
        id: roleId
      }
    });
    return response.data;
  }

};