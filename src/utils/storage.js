/**
 * localStorage 安全封装
 * - 自动 JSON 序列化/反序列化
 * - 读写异常时优雅降级，不中断业务流程
 */

const PREFIX = 'react_admin_'

/**
 * 写入本地存储
 * @param {string} key 键名（自动加前缀）
 * @param {*} value 任意可序列化值
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('[storage] set error:', key, e)
  }
}

/**
 * 读取本地存储
 * @param {string} key 键名
 * @param {*} defaultValue 解析失败或不存在时的默认值
 * @returns {*} 解析后的值
 */
export function getStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return defaultValue
    return JSON.parse(raw)
  } catch (e) {
    console.error('[storage] get error:', key, e)
    return defaultValue
  }
}

/**
 * 移除指定键
 * @param {string} key 键名
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    console.error('[storage] remove error:', key, e)
  }
}

/**
 * 清空所有带前缀的业务存储项（保留第三方库数据）
 */
export function clearStorage() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch (e) {
    console.error('[storage] clear error:', e)
  }
}

// 常用存储键常量，避免散落魔法字符串
export const STORAGE_KEYS = {
  TOKEN: 'satoken',
  USER_INFO: 'user_info',
  PERMISSIONS: 'permissions',
  THEME: 'theme',
  AVATAR: 'avatar',
}
