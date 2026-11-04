// copy 'vant/lib/utils'
export const pick = (obj: any, keys: any, ignoreUndefined?: any) => {
  return keys.reduce((ret, key) => {
    if (!ignoreUndefined || obj[key] !== void 0) {
      ret[key] = obj[key]
    }
    return ret
  }, {})
}

/**
 * 递归转换 为ky-pick要的数据
 */
export const convertTree = (sourceArray, keyMap) => {
  return sourceArray.map((item) => {
    const newItem = {}

    // 遍历键映射对象，逐个转换属性
    for (const [newKey, sourceKey] of Object.entries(keyMap)) {
      // 处理children属性（递归转换子节点）
      if (newKey === 'children' && item[sourceKey as any]) {
        const childArray = item[sourceKey as any]
        newItem[newKey] = Array.isArray(childArray) ? convertTree(childArray, keyMap) : []
      }
      // 处理普通属性
      else {
        newItem[newKey] = item[sourceKey as any]
      }
    }

    return newItem
  })
}
