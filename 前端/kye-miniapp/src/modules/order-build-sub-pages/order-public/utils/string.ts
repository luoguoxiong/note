import { arrayBufferToBase64 } from '@tarojs/taro'
/**
 * @description 首字母转为小写
 * @param str
 */
export const uncapitalLize = (str: string) => {
  if (str?.length > 1) {
    return `${str[0].toLowerCase()}${str.slice(1)}`
  } else {
    return str
  }
}

/**
 * @description 首字母转为大写
 */
export const capitalLize = (str: string) => {
  if (str.length > 1) {
    return `${str[0].toUpperCase()}${str.slice(1)}`
  } else {
    return str
  }
}

/**
 * @description 判断入参是否布尔值或字符串true false
 * @param input
 */
export const isBooleanString = (input: string | boolean) =>
  typeof input === 'boolean' || input === 'true' || input === 'false'

/**
 * @description 把0和1转换为布尔值
 * @param str
 */
export const transformNumberToBoolean = (str: string) => str === '1'

/**
 * @description 判断是否为null或undefined或空字符串
 * @param value
 */
export const isNullOrUndefinedOrEmptyString = (value: unknown) => {
  return value === null || value === undefined || value === ''
}

/**
 * 更改html标签的style属性样式
 * @param htmlString html字符串
 * @param tag 要更改的标签名称 例如 'p'
 * @param styleContent 要添加的样式内容 例如 'color:red;'
 * @returns string
 */
export const modifyHtmlTagString = (htmlString, tag, styleContent) => {
  if (typeof htmlString !== 'string' || !tag || !styleContent) return htmlString

  // 创建正则表达式来匹配目标标签
  const regex = new RegExp(`(<${tag}\\s*)([^>]*)>`, 'gi')

  return htmlString.replace(regex, (match, p1, p2) => {
    // 检查是否已有style属性
    const styleRegex = /style="([^"]*)"/i
    const styleMatch = p2.match(styleRegex)

    let newStyle
    if (styleMatch) {
      // 合并样式
      const existingStyle = styleMatch[1]
      newStyle = `style="${existingStyle} ${styleContent}"`

      // 替换原有的style属性
      return `${p1}${p2.replace(styleRegex, newStyle)}>`
    } else {
      // 添加新样式属性
      newStyle = `style="${styleContent}"`
      return `${p1}${p2} ${newStyle}>`
    }
  })
}
// 手动 UTF-8 编码：字符串 → 字节数组
export const utf8ToBytes = (str: string): number[] => {
  const bytes: number[] = []
  for (let i = 0; i < str.length; i++) {
    let code = str.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
    } else if (code >= 0xd800 && code <= 0xdbff) {
      // 代理对（emoji 等）
      code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(++i) & 0x3ff))
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      )
    } else {
      bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
    }
  }
  return bytes
}
export const toBase64 = (num: number | string | undefined) => {
  if (!num) {
    return ''
  }
  try {
    const str = String(num)
    // 1. 手动 UTF-8 编码（替代 TextEncoder）
    const bytes = utf8ToBytes(str)
    // 2. 字节数组 → ArrayBuffer → Base64
    const buffer = new Uint8Array(bytes).buffer
    return arrayBufferToBase64(buffer)
  } catch (e) {
    console.log('toBase64 error', e)
    return String(num ?? '')
  }
}