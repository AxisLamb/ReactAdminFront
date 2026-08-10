/**
 * 通用工具函数集合
 * 包含树结构遍历、权限收集、字节/日期格式化等
 */

/**
 * 递归遍历树形结构，对每个节点执行回调
 * @param {Array} tree 树形数组
 * @param {(node: object, parent: object|null) => void} callback 节点回调
 * @param {string} childrenKey 子节点字段名，默认 children
 */
export function traverseTree(tree, callback, childrenKey = 'children') {
  if (!Array.isArray(tree)) return
  const walk = (nodes, parent) => {
    nodes.forEach((node) => {
      callback(node, parent)
      if (node[childrenKey] && node[childrenKey].length) {
        walk(node[childrenKey], node)
      }
    })
  }
  walk(tree, null)
}

/**
 * 将扁平列表（含 parentId）转换为树形结构
 * 仅拥有子节点的节点才会携带 children 字段（叶子节点不带空数组，
 * 避免 Table 树形展示时叶子行出现无意义的展开箭头）
 * @param {Array} list 扁平数组，每项含 id 和 parentId 字段
 * @param {string} idKey 主键字段名，默认 'menuId'
 * @param {string} parentKey 父级字段名，默认 'parentId'
 * @param {string} childrenKey 子节点字段名，默认 'children'
 * @returns {Array} 树形数组
 */
export function listToTree(list, idKey = 'menuId', parentKey = 'parentId', childrenKey = 'children') {
  if (!Array.isArray(list)) return []
  const map = {}
  const roots = []
  list.forEach((item) => {
    map[item[idKey]] = { ...item }
  })
  list.forEach((item) => {
    const node = map[item[idKey]]
    const pid = item[parentKey]
    if (pid === 0 || pid === null || pid === undefined || !map[pid]) {
      roots.push(node)
    } else {
      const parent = map[pid]
      if (!parent[childrenKey]) parent[childrenKey] = []
      parent[childrenKey].push(node)
    }
  })
  return roots
}

/**
 * 从菜单树中收集所有非空权限标识
 * @param {Array} menus 菜单树
 * @returns {string[]} 去重后的权限标识数组
 */
export function collectPermissions(menus) {
  const perms = new Set()
  traverseTree(menus, (node) => {
    if (node.perms) perms.add(node.perms)
  })
  return Array.from(perms)
}

/**
 * 收集树中所有节点的指定字段值（用于展开所有节点等场景）
 * @param {Array} tree 树形数组
 * @param {string} keyField 要收集的字段名
 * @param {string} childrenKey 子节点字段名
 * @returns {Array} 字段值数组
 */
export function collectTreeKeys(tree, keyField, childrenKey = 'children') {
  const keys = []
  traverseTree(
    tree,
    (node) => {
      if (node[keyField] !== undefined && node[keyField] !== null) {
        keys.push(node[keyField])
      }
    },
    childrenKey,
  )
  return keys
}

/**
 * 字节数格式化为可读字符串
 * @param {number} bytes 字节数
 * @returns {string} 如 "1.2 MB"
 */
export function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || isNaN(bytes)) return '-'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)
  return `${size} ${units[i]}`
}

/**
 * 日期格式化
 * @param {string|number|Date} value 日期值
 * @param {string} fmt 格式模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的字符串
 */
export function formatDate(value, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!value) return '-'
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return String(value)
  const pad = (n) => String(n).padStart(2, '0')
  const map = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (token) => map[token])
}

/**
 * 根据当前小时返回问候语
 * @returns {string} 早上好/下午好/晚上好
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 6) return '凌晨好'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

/**
 * 字节数格式化为可读字符串（别名，兼容旧调用方）
 * @deprecated 请使用 formatFileSize
 */
export const formatBytes = formatFileSize

/**
 * 日期格式化（别名，兼容旧调用方）
 * @deprecated 请使用 formatDate
 */
export const formatDateTime = formatDate

/**
 * 头像更新事件名
 * 个人中心上传头像成功后派发，顶栏 Header 监听后实时刷新头像回显
 */
export const AVATAR_UPDATED_EVENT = 'app:avatar-updated'

/**
 * 防抖函数
 * @param {Function} fn 目标函数
 * @param {number} delay 延迟毫秒数
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
