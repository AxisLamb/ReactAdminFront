import PropTypes from 'prop-types'
import { useUserStore } from '../../store/userStore'

/**
 * 按钮级权限包裹组件
 * 拥有权限时渲染 children，否则渲染 fallback（默认 null）
 *
 * @example
 * <Permission perms="sys:user:save">
 *   <Button type="primary">新增用户</Button>
 * </Permission>
 *
 * // 多个权限任一满足即可
 * <Permission perms={['sys:user:update', 'sys:user:delete']}>...</Permission>
 */
function Permission({ perms, fallback = null, children }) {
  const hasPermission = useUserStore((s) => s.hasPermission)

  if (!perms) return children
  return hasPermission(perms) ? children : fallback
}

Permission.propTypes = {
  /** 权限标识，字符串或字符串数组（数组为任一满足） */
  perms: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** 无权限时的替代渲染内容，默认不渲染 */
  fallback: PropTypes.node,
  children: PropTypes.node,
}

export default Permission
