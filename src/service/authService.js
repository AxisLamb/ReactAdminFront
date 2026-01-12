import apiClient from '../utils/apiClient';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const authService = {
  /**
   * Login with username and password
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>} Response with token
   */
  async login(username, password) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password
    });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post(`${API_BASE_URL}/auth/logout`);
    return response.data;
  }
};