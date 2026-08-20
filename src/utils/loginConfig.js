/**
 * 登录页轮播配置
 * 后端暂无配置存储接口，开关与轮播间隔持久化在 localStorage，
 * 登录页（未登录态）与系统配置页（已登录态）同源共享读取
 */

import { getStorage, setStorage, STORAGE_KEYS } from '@/utils/storage'

/** 默认配置：关闭轮播，间隔 5 秒 */
export const DEFAULT_CAROUSEL_CONFIG = { enabled: false, interval: 5 }

/**
 * 读取轮播配置（容错合并默认值）
 * @returns {{enabled: boolean, interval: number}}
 */
export function getCarouselConfig() {
  const saved = getStorage(STORAGE_KEYS.LOGIN_CAROUSEL, null)
  const merged = { ...DEFAULT_CAROUSEL_CONFIG, ...(saved || {}) }
  // 间隔合法性兜底：1-60 秒
  if (typeof merged.interval !== 'number' || merged.interval < 1 || merged.interval > 60) {
    merged.interval = DEFAULT_CAROUSEL_CONFIG.interval
  }
  return merged
}

/**
 * 保存轮播配置（增量合并）
 * @param {{enabled?: boolean, interval?: number}} config
 */
export function saveCarouselConfig(config) {
  setStorage(STORAGE_KEYS.LOGIN_CAROUSEL, { ...getCarouselConfig(), ...config })
}
