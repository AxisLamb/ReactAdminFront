import { useEffect, useCallback } from 'react'
import { useDictStore } from '../store/dictStore'

/**
 * 字典数据 Hook
 * 挂载时自动加载传入的字典类型，并提供标签/选项读取方法
 *
 * @param {string|string[]} types 需要加载的字典类型
 * @returns {{
 *   getDictLabel: (type: string, value: any) => string,
 *   getDictOptions: (type: string) => Array<{label, value}>,
 *   dictMap: object
 * }}
 *
 * @example
 * const { getDictLabel, getDictOptions } = useDict('sys_user_status')
 * <Select options={getDictOptions('sys_user_status')} />
 */
export function useDict(types) {
  const dictMap = useDictStore((s) => s.dictMap)
  const loadDict = useDictStore((s) => s.loadDict)
  const getLabel = useDictStore((s) => s.getLabel)
  const getOptions = useDictStore((s) => s.getOptions)

  // 归一化为数组并去重
  const typeList = Array.isArray(types)
    ? types
    : types
      ? [types]
      : []

  useEffect(() => {
    typeList.forEach((type) => {
      if (type) loadDict(type)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeList.join(','), loadDict])

  const getDictLabel = useCallback(
    (type, value) => getLabel(type, value),
    [getLabel],
  )
  const getDictOptions = useCallback(
    (type) => getOptions(type),
    [getOptions],
  )

  return { getDictLabel, getDictOptions, dictMap }
}

export default useDict
