import { useCallback } from 'react'
import { useUserStore } from '@/store/userStore'

/**
 * 按钮级权限 Hook
 * @returns {{ hasPermission: (perms: string|string[]) => boolean, permissions: string[] }}
 *
 * @example
 * const { hasPermission } = usePermission()
 * {hasPermission('sys:user:save') && <Button>新增</Button>}
 */
export function usePermission() {
  const permissions = useUserStore((s) => s.permissions)

  // 稳定引用的判断函数，支持单个或多个权限（任一满足）
  const hasPermission = useCallback(
    (perms) => {
      if (!perms) return true
      const list = Array.isArray(perms) ? perms : [perms]
      return list.some((p) => permissions.includes(p))
    },
    [permissions],
  )

  return { hasPermission, permissions }
}

export default usePermission
