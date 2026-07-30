import { create } from 'zustand'
import { getDictItemsByType } from '../api/dict'

/**
 * 字典缓存状态管理
 * 按 dictType 缓存字典项，请求中状态去重（同 type 并发只发一次）
 */
export const useDictStore = create((set, get) => ({
  // 缓存数据：{ [dictType]: [{itemLabel, itemValue, ...}] }
  dictMap: {},
  // 请求中状态：{ [dictType]: Promise }，用于并发去重
  loadingMap: {},

  /**
   * 加载指定类型的字典项（带缓存与去重）
   * @param {string} dictType
   * @returns {Promise<Array>} 字典项数组
   */
  loadDict: async (dictType) => {
    if (!dictType) return []
    const { dictMap, loadingMap } = get()
    // 已缓存直接返回
    if (dictMap[dictType]) return dictMap[dictType]
    // 请求中则复用同一 Promise，避免重复请求
    if (loadingMap[dictType]) return loadingMap[dictType]

    const promise = getDictItemsByType(dictType)
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        set((state) => ({
          dictMap: { ...state.dictMap, [dictType]: list },
        }))
        return list
      })
      .catch((e) => {
        console.error('[dictStore] load dict error:', dictType, e)
        return []
      })
      .finally(() => {
        set((state) => {
          const next = { ...state.loadingMap }
          delete next[dictType]
          return { loadingMap: next }
        })
      })

    set((state) => ({
      loadingMap: { ...state.loadingMap, [dictType]: promise },
    }))
    return promise
  },

  /**
   * 获取字典下拉选项
   * @param {string} dictType
   * @returns {Array<{label: string, value: string}>}
   */
  getOptions: (dictType) => {
    const list = get().dictMap[dictType] || []
    return list.map((item) => ({
      label: item.itemLabel,
      value: item.itemValue,
    }))
  },

  /**
   * 获取字典标签，未命中时优雅降级返回原值
   * @param {string} dictType
   * @param {string|number} value
   * @returns {string}
   */
  getLabel: (dictType, value) => {
    if (value === null || value === undefined || value === '') return '-'
    const list = get().dictMap[dictType] || []
    const matched = list.find(
      (item) => String(item.itemValue) === String(value),
    )
    return matched ? matched.itemLabel : String(value)
  },

  /**
   * 清除指定或全部字典缓存（字典管理页变更后刷新）
   * @param {string} [dictType] 不传则清空全部
   */
  clearCache: (dictType) => {
    if (dictType) {
      set((state) => {
        const next = { ...state.dictMap }
        delete next[dictType]
        return { dictMap: next }
      })
    } else {
      set({ dictMap: {}, loadingMap: {} })
    }
  },
}))
