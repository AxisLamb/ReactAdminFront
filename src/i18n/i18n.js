// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
        "unknown_error": "Unknown error, please contact administrator",
        "network_error": "Network error, please check connection",
        "bad_request": "Bad request",
        "unauthorized": "Unauthorized access",
        "forbidden": "Access forbidden",
        "unknown_status": "Unknown status"
    }
  },
  zh: {
    translation: {
        "unknown_error": "未知异常，请联系管理员",
        "network_error": "网络错误，请检查连接",
        "bad_request": "请求参数错误",
        "unauthorized": "未授权访问",
        "forbidden": "没有权限访问该资源",
        "unknown_status": "未知状态"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "zh", // default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;