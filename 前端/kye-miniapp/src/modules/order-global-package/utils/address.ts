/**
 * 地址组件通用工具函数
 * 从 @order-public/utils 迁移，供 address-ocr / selectModel 等组件使用
 */

/** 处理值异常问题 */
export const getValueOrEmpty = (value: string | undefined | null) => {
  return value || ''
}

/** 按指定 keys 拼接对象属性值 */
interface PlainObject {
  [key: string]: any
}
export const joinAt = (val: PlainObject, keys: string[], joinKey = '/') => {
  let str = ''
  keys.forEach((v, i) => {
    if (val[v]) {
      str = str + val[v]
      if (i < keys.length - 1) {
        str = str + joinKey
      }
    }
  })
  return str
}
