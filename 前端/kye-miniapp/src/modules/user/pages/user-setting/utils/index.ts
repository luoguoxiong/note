import Taro from '@tarojs/taro'
export * from './user-avatar'
/**
 * 格式化手机号
 * @param phone
 * @returns {string}
 */
export const formatPhone = (phone: string) => {
  if (!phone) return ''
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

export const selectedValueToDateStr = (selectedValue: any): string => {
  const [year, month, day] = [selectedValue[0], selectedValue[1], selectedValue[2]]
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}
