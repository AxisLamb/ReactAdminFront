import request from '@/utils/request'

/**
 * 数据字典与字典项接口
 */

/* ========== 数据字典 ========== */

/**
 * 分页查询字典列表
 * @param {{current?, size?, dictName?, dictType?, status?}} params
 */
export function getDictPage(params) {
  return request.get('/sys/dict/page', { params })
}

/**
 * 查询字典列表（不分页）
 * @param {{dictName?, dictType?, status?}} params
 */
export function getDictList(params) {
  return request.get('/sys/dict/list', { params })
}

/**
 * 根据ID获取字典详情
 * @param {number} dictId
 */
export function getDictDetail(dictId) {
  return request.get(`/sys/dict/${dictId}`)
}

/**
 * 新增字典
 * @param {{dictName, dictType, status, remark}} data
 */
export function addDict(data) {
  return request.post('/sys/dict', data)
}

/**
 * 修改字典（PUT）
 * @param {{dictId, dictName, dictType, status, remark}} data
 */
export function updateDict(data) {
  return request.put('/sys/dict', data)
}

/**
 * 删除字典（DELETE 路径参数，同时删除关联字典项）
 * @param {number} dictId
 */
export function deleteDict(dictId) {
  return request.delete(`/sys/dict/${dictId}`)
}

/* ========== 字典项 ========== */

/**
 * 分页查询字典项列表
 * @param {{current?, size?, dictId?, itemLabel?, status?}} params
 */
export function getDictItemPage(params) {
  return request.get('/sys/dict/item/page', { params })
}

/**
 * 查询字典项列表（不分页）
 * @param {{dictId?, itemLabel?, status?}} params
 */
export function getDictItemList(params) {
  return request.get('/sys/dict/item/list', { params })
}

/**
 * 根据ID获取字典项详情
 * @param {number} itemId
 */
export function getDictItemDetail(itemId) {
  return request.get(`/sys/dict/item/${itemId}`)
}

/**
 * 根据字典类型获取启用的字典项列表（下拉框常用）
 * @param {string} dictType
 */
export function getDictItemsByType(dictType) {
  return request.get(`/sys/dict/item/type/${dictType}`)
}

/**
 * 新增字典项
 * @param {{dictId, itemLabel, itemValue, status, orderNum, remark}} data
 */
export function addDictItem(data) {
  return request.post('/sys/dict/item', data)
}

/**
 * 修改字典项（PUT）
 * @param {{itemId, dictId, itemLabel, itemValue, status, orderNum, remark}} data
 */
export function updateDictItem(data) {
  return request.put('/sys/dict/item', data)
}

/**
 * 删除字典项（DELETE 路径参数）
 * @param {number} itemId
 */
export function deleteDictItem(itemId) {
  return request.delete(`/sys/dict/item/${itemId}`)
}
