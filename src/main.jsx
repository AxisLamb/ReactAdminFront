import React from 'react'
import ReactDOM from 'react-dom/client'
// antd v5 在 React 19 下的官方兼容补丁：
// 修复 Modal.confirm / message / notification 等静态方法静默失效的问题
import '@ant-design/v5-patch-for-react-19'
import App from './App.jsx'
import './styles/global.css'

// 应用挂载入口（全局样式、Router、ConfigProvider 将在后续任务中接入）
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
