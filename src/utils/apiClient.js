// src/utils/apiClient.js
import axios from 'axios';
import { showMessage } from './messageUtil';
import i18n from '../i18n/i18n';

// Create axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ''
});

// Add a request interceptor to include token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('satoken');
    if (token) {
      config.headers['satoken'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle unified response format
apiClient.interceptors.response.use(
  (response) => {
    // Handle unified response format
    const { code, msg, data } = response.data;
    
    if (code === 0) {
      // Success - return only the data part
      return { ...response, data };
    } else {
      // Handle different error codes
      switch (code) {
        case 400:
          const badRequestMsg = msg || i18n.t('bad_request', 'Bad request');
          showMessage(badRequestMsg, 'error');
          break;
        case 401:
          const unauthorizedMsg = msg || i18n.t('unauthorized', 'Unauthorized access');
          showMessage(unauthorizedMsg, 'error');
          // Optional: Redirect to login page
          // window.location.href = '/login';
          break;
        case 403:
          const forbiddenMsg = msg || i18n.t('forbidden', 'Access forbidden');
          showMessage(forbiddenMsg, 'error');
          break;
        case 500:
          const serverErrorMsg = msg || i18n.t('unknown_error', 'Unknown error, please contact administrator');
          showMessage(serverErrorMsg, 'error');
          break;
        default:
          const defaultMsg = msg || i18n.t('unknown_status', 'Unknown status');
          showMessage(defaultMsg, 'warning');
      }
      return Promise.reject(new Error(msg || `Error code: ${code}`));
    }
  },
  (error) => {
    // Handle network errors or other axios errors
    const networkError = i18n.t('network_error', 'Network error, please check connection');
    showMessage(networkError, 'error');
    return Promise.reject(error);
  }
);

export default apiClient;