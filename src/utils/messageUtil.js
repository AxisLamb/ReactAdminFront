// src/utils/messageUtil.js
import { message } from 'antd';

// Create a reference to store the messageApi
let messageApiInstance = null;

// Function to set the messageApi instance
export const setMessageApi = (api) => {
  messageApiInstance = api;
};

// Enhanced showMessage function that uses either the global api or falls back to default message
export const showMessage = (content, type = 'info', duration = 3) => {
  if (messageApiInstance) {
    // Use the global messageApi if available
    switch (type) {
      case 'success':
        messageApiInstance.success(content, duration);
        break;
      case 'error':
        messageApiInstance.error(content, duration);
        break;
      case 'warning':
        messageApiInstance.warning(content, duration);
        break;
      case 'info':
        messageApiInstance.info(content, duration);
        break;
      default:
        messageApiInstance.info(content, duration);
    }
  } else {
    // Fallback to default message (for cases where messageApi is not yet initialized)
    switch (type) {
      case 'success':
        message.success(content, duration);
        break;
      case 'error':
        message.error(content, duration);
        break;
      case 'warning':
        message.warning(content, duration);
        break;
      case 'info':
        message.info(content, duration);
        break;
      default:
        message.info(content, duration);
    }
  }
};

export default showMessage;