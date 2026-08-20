import { useEffect, useMemo } from 'react'
import { theme as antdTheme } from 'antd'
import { useAppStore } from '@/store/appStore'

// 各主题对应的 AntD 主色
const THEME_PRIMARY = {
  light: '#1890FF',
  dark: '#1890FF',
  blue: '#2F54EB',
  green: '#389E0D',
}

// 主题元信息（供切换下拉展示）
export const THEME_LIST = [
  { key: 'light', label: '亮色', color: '#1890FF' },
  { key: 'dark', label: '暗色', color: '#001529' },
  { key: 'blue', label: '蓝色', color: '#2F54EB' },
  { key: 'green', label: '绿色', color: '#389E0D' },
]

/**
 * 主题 Hook
 * - 同步 document.documentElement.dataset.theme 驱动 CSS Variables
 * - 生成 AntD ConfigProvider 所需的 theme 配置（dark 用 darkAlgorithm）
 *
 * @returns {{
 *   theme: string,
 *   setTheme: (t: string) => void,
 *   antdThemeConfig: object,
 *   themeList: Array
 * }}
 */
export function useTheme() {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  // 主题变化时写入根节点 data-theme，驱动全局 CSS 变量
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // 生成 AntD 主题配置
  const antdThemeConfig = useMemo(() => {
    const config = {
      token: {
        colorPrimary: THEME_PRIMARY[theme] || '#1890FF',
        borderRadius: 6,
        fontFamily:
          "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, sans-serif",
      },
    }
    if (theme === 'dark') {
      config.algorithm = antdTheme.darkAlgorithm
    }
    return config
  }, [theme])

  return { theme, setTheme, antdThemeConfig, themeList: THEME_LIST }
}

export default useTheme
