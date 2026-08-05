import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 应用全局状态管理
 * 负责侧边栏折叠状态与主题，均持久化到 localStorage
 */
export const useAppStore = create(
  persist(
    (set, get) => ({
      // 侧边栏是否折叠
      collapsed: false,
      // 当前主题：light / dark / blue / green
      theme: 'light',
      // 水印是否开启
      watermarkEnabled: true,

      /**
       * 切换侧边栏折叠状态
       * @param {boolean} [value] 不传则取反
       */
      toggleCollapsed: (value) =>
        set({ collapsed: value === undefined ? !get().collapsed : value }),

      /**
       * 设置主题
       * @param {'light'|'dark'|'blue'|'green'} theme
       */
      setTheme: (theme) => set({ theme }),

      /**
       * 切换水印显示
       * @param {boolean} [value] 不传则取反
       */
      toggleWatermark: (value) =>
        set({ watermarkEnabled: value === undefined ? !get().watermarkEnabled : value }),
    }),
    {
      name: 'react_admin_app',
      // 仅持久化折叠、主题、水印字段
      partialize: (state) => ({
        collapsed: state.collapsed,
        theme: state.theme,
        watermarkEnabled: state.watermarkEnabled,
      }),
    },
  ),
)
