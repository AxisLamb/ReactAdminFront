/**
 * useFileUrl
 * 管理文件访问链接（MINIO 预签名 URL）：
 * - 通过 /images/url 获取访问链接，并在签名过期前提前调用 getUserAvatarUrl 刷新，避免图片加载失败
 * - 图片加载失败（如签名已过期）时自动重取新链接，带冷却与次数限制，防止无效链接反复请求
 * - 标签页从后台切回时校验链接是否已过期，弥补后台定时器被浏览器节流的场景
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { getUserAvatarUrl } from '@/api/user'
import { buildAuthUrl } from '@/utils/helpers'

/** 提前刷新余量：签名到期前 60s 刷新，规避时钟偏差与网络耗时 */
const REFRESH_LEAD_MS = 60 * 1000
/** 图片加载失败后的最大连续重试次数（防止无效链接死循环请求） */
const MAX_ERROR_RETRY = 3
/** 加载失败重试冷却时间 */
const RETRY_COOLDOWN_MS = 10 * 1000

/**
 * 解析 MINIO 预签名 URL 的过期时间（本地时间戳，毫秒）
 * 依据查询参数 X-Amz-Date（签发时刻，UTC）与 X-Amz-Expires（有效秒数）计算。
 * 无法解析时返回 0，此时退化为不启用定时刷新，仅靠 onError 兜底。
 * @param {string} url 预签名 URL
 * @returns {number} 过期时间戳（毫秒），解析失败返回 0
 */
export function parseExpiryTime(url) {
  try {
    const u = new URL(url)
    const amzDate = u.searchParams.get('X-Amz-Date')
    const expires = Number(u.searchParams.get('X-Amz-Expires') || 0)
    if (!amzDate || !expires) return 0
    // X-Amz-Date 形如 20260817T154644Z
    const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(amzDate)
    if (!m) return 0
    const [, y, mo, d, h, mi, s] = m
    return Date.parse(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`) + expires * 1000
  } catch {
    return 0
  }
}

/**
 * 文件访问链接 Hook
 * @param {string} businessType 业务类型（如 avatar）
 * @param {{initialUrl?: string, bust?: boolean}} options
 *   initialUrl 旧版 dataURL / 外链，存在时直接回显、不请求 /images/url 且不启用自动刷新
 *   bust 默认是否追加时间戳防浏览器缓存
 * @returns {{url: string, refresh: (forceBust?: boolean) => Promise<string>, onError: () => boolean}}
 */
export function useFileUrl(businessType, options = {}) {
  const { initialUrl = '', bust = false } = options
  const [url, setUrl] = useState(initialUrl)
  const urlRef = useRef(initialUrl)
  const initialRef = useRef(initialUrl)
  const timerRef = useRef(null)
  const mountedRef = useRef(true)
  const errorRetryRef = useRef(0)
  const lastErrorAtRef = useRef(0)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const load = useCallback(
    async (forceBust = false) => {
      const raw = await getUserAvatarUrl()
      const next = buildAuthUrl(raw, forceBust || bust)
      if (!mountedRef.current) return next
      urlRef.current = next
      setUrl(next)
      errorRetryRef.current = 0
      // 依据签名有效期安排下一次自动刷新（到期前 REFRESH_LEAD_MS 触发）
      const exp = parseExpiryTime(next)
      const delay = exp ? Math.max(0, exp - Date.now() - REFRESH_LEAD_MS) : 0
      clearTimer()
      if (delay > 0) {
        timerRef.current = setTimeout(() => {
          load(false).catch((e) => console.error('[useFileUrl] auto refresh error:', e))
        }, delay)
      }
      return next
    },
    [businessType, bust, clearTimer],
  )

  /** 手动刷新（forceBust 为 true 时追加时间戳强制绕过浏览器缓存） */
  const refresh = useCallback(
    async (forceBust = false) => {
      const next = await load(forceBust)
      return next
    },
    [load],
  )

  /**
   * 图片加载失败处理：冷却 + 次数限制后自动重取新链接。
   * 返回 true 交给 antd Avatar 展示占位回退，避免一直显示裂图。
   */
  const onError = useCallback(() => {
    const now = Date.now()
    if (now - lastErrorAtRef.current < RETRY_COOLDOWN_MS) return true
    if (errorRetryRef.current >= MAX_ERROR_RETRY) {
      console.warn(`[useFileUrl] ${businessType} 多次加载失败，停止自动重试`)
      return true
    }
    errorRetryRef.current += 1
    lastErrorAtRef.current = now
    refresh().catch((e) => console.error(`[useFileUrl] ${businessType} retry error:`, e))
    return true
  }, [refresh, businessType])

  // 首次加载 / 卸载清理
  useEffect(() => {
    mountedRef.current = true
    if (initialRef.current) return undefined
    load().catch((e) => console.error(`[useFileUrl] load ${businessType} error:`, e))
    return () => {
      mountedRef.current = false
      clearTimer()
    }
  }, [load, clearTimer, businessType])

  // 标签页从后台切回时，若链接已过期则立即刷新（后台定时器可能被浏览器节流延迟）
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const exp = parseExpiryTime(urlRef.current)
      if (exp && exp - Date.now() <= REFRESH_LEAD_MS) {
        refresh().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  return { url, refresh, onError }
}

export default useFileUrl
