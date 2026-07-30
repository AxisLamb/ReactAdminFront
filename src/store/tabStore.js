import { create } from 'zustand'

// 首页标签（固定不可关闭）
const HOME_TAB = { key: '/dashboard', title: '首页', closable: false }

/**
 * 多标签页状态管理
 * 配合 KeepAlive 容器实现页面缓存与刷新
 */
export const useTabStore = create((set, get) => ({
  // 已打开标签列表
  tabs: [HOME_TAB],
  // 当前激活标签 key（即路由 path）
  activeKey: HOME_TAB.key,
  // KeepAlive 缓存的页面 key 列表
  cachedKeys: [HOME_TAB.key],
  // 各标签刷新计数，refreshKey[key]++ 触发该页重挂载
  refreshKey: {},

  /**
   * 新增/激活标签
   * @param {{key: string, title: string, closable?: boolean}} tab
   */
  addTab: (tab) => {
    const { tabs, cachedKeys } = get()
    const key = tab.key
    const exists = tabs.some((t) => t.key === key)
    const nextTabs = exists
      ? tabs
      : [...tabs, { closable: true, ...tab }]
    const nextCached = cachedKeys.includes(key)
      ? cachedKeys
      : [...cachedKeys, key]
    set({ tabs: nextTabs, activeKey: key, cachedKeys: nextCached })
  },

  /**
   * 激活指定标签
   * @param {string} key
   */
  setActive: (key) => set({ activeKey: key }),

  /**
   * 关闭标签
   * @param {string} key
   * @returns {string|null} 若关闭的是当前激活标签，返回应跳转的相邻标签 key
   */
  removeTab: (key) => {
    const { tabs, activeKey, cachedKeys } = get()
    const index = tabs.findIndex((t) => t.key === key)
    if (index === -1 || tabs[index].closable === false) return null
    const nextTabs = tabs.filter((t) => t.key !== key)
    const nextCached = cachedKeys.filter((k) => k !== key)
    let nextActive = activeKey
    // 关闭当前激活标签时，激活相邻标签（优先右侧）
    if (activeKey === key) {
      const neighbor = nextTabs[index] || nextTabs[index - 1] || nextTabs[0]
      nextActive = neighbor ? neighbor.key : HOME_TAB.key
    }
    set({ tabs: nextTabs, cachedKeys: nextCached, activeKey: nextActive })
    return activeKey === key ? nextActive : null
  },

  /**
   * 关闭其他标签（保留首页与当前标签）
   * @param {string} key 当前标签 key
   */
  removeOtherTabs: (key) => {
    const { tabs } = get()
    const nextTabs = tabs.filter((t) => t.closable === false || t.key === key)
    const nextCached = nextTabs.map((t) => t.key)
    set({ tabs: nextTabs, cachedKeys: nextCached, activeKey: key })
  },

  /**
   * 关闭全部标签（仅保留首页）
   */
  removeAllTabs: () => {
    set({
      tabs: [HOME_TAB],
      activeKey: HOME_TAB.key,
      cachedKeys: [HOME_TAB.key],
      refreshKey: {},
    })
  },

  /**
   * 刷新指定标签页（递增 refreshKey 强制重挂载）
   * @param {string} key
   */
  refreshTab: (key) => {
    const { refreshKey } = get()
    set({ refreshKey: { ...refreshKey, [key]: (refreshKey[key] || 0) + 1 } })
  },
}))
