/**
 * 格式化工具(局部化)
 * 来源: customer-code/*.vue 引用的 @utils/format.formatMobliePhone (netc-pc-web/src/utils/format.js)
 * 及 contact-phone-dialog 内联的 filterMobliePhone
 */

/** 手机号 3-4-4 分组展示, 非 11 位原样返回 */
export const formatMobliePhone = (phone: string | number, separator = ' '): string => {
  if (!phone || `${phone}`.trim().length !== 11) {
    return (phone as string) || ''
  }
  const reg = /^(\d{3})(\d{0,4})(\d+)?/
  return `${phone}`.replace(reg, `$1${separator}$2${separator}$3`).trim()
}

/** 手机号脱敏: 138****1234 */
export const filterMobliePhone = (val = ''): string => {
  if (!val) return ''
  const pat = /(\d{3})\d*(\d{4})/
  return val.replace(/\s/g, '').replace(pat, '$1****$2')
}
