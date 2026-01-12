import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import 'antd/dist/reset.css'; // For Ant Design 5.x
import '@ant-design/v5-patch-for-react-19';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
