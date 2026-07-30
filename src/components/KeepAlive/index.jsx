import { Suspense, useMemo } from 'react'
import { useUserStore } from '../../store/userStore'
import { useTabStore } from '../../store/tabStore'
import {
  componentRegistry,
  buildPathComponentMap,
  PageLoading,
  NotFound,
} from '../../routes'

/**
 * KeepAlive 缓存容器
 * 采用"保持挂载 + display 切换"方案：
 * - 同时渲染所有 cachedKeys 对应页面，非激活页 display:none（状态保留）
 * - 刷新标签页通过 refreshKey 递增使 key 变化，强制该页重挂载
 * - 关闭标签时同步移出 cachedKeys，组件随之卸载
 */
function KeepAlive() {
  const routes = useUserStore((s) => s.routes)
  const cachedKeys = useTabStore((s) => s.cachedKeys)
  const activeKey = useTabStore((s) => s.activeKey)
  const refreshKey = useTabStore((s) => s.refreshKey)

  // path -> 组件名 映射
  const pathMap = useMemo(() => buildPathComponentMap(routes), [routes])

  return (
    <div className="keepalive-container">
      {cachedKeys.map((key) => {
        const compName = pathMap[key]
        const Comp = compName ? componentRegistry[compName] : null
        const isActive = key === activeKey
        const rk = refreshKey[key] || 0
        return (
          <div
            key={`${key}__${rk}`}
            className={`keepalive-page${isActive ? ' keepalive-page-active' : ''}`}
            style={{ display: isActive ? 'block' : 'none' }}
          >
            {Comp ? (
              <Suspense fallback={<PageLoading />}>
                <Comp />
              </Suspense>
            ) : (
              // 未注册组件或无权限路径降级为 404 提示
              isActive ? <NotFound /> : null
            )}
          </div>
        )
      })}
    </div>
  )
}

export default KeepAlive
