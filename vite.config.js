import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载 .env 及 .env.[mode] 中的环境变量（第三个参数传 '' 表示不过滤前缀）
  const env = loadEnv(mode, process.cwd(), '')
  // 后端服务地址（域名或 IP），由环境文件 VITE_API_TARGET 配置，默认 localhost:8888
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:8888'
  // 前端请求的 API 前缀，需与 src/utils/request.js 中 VITE_API_BASE_URL 保持一致（均以 / 开头）
  const apiBase = env.VITE_API_BASE_URL || '/api'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        // @ 指向 src 目录，统一模块引用路径
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      // 开发环境代理：/api -> 后端地址（去掉 /api 前缀），后端地址由环境文件 VITE_API_TARGET 配置
      proxy: {
        [apiBase]: {
          target: apiTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${apiBase}`), ''),
        },
      },
    },
  }
})
