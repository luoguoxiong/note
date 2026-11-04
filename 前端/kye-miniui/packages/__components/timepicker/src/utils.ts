export const isDate = (val: unknown): val is Date =>
  Object.prototype.toString.call(val) === '[object Date]' && !Number.isNaN((val as Date).getTime())

/* 日期添加0判断 */
export const padZero = (num: number | string, length = 2): string => {
  num += ''
  while ((num as string).length < length) {
    num = '0' + num
  }
  return num.toString()
}

/**
 * 数组日期转Date
 * @param arr 如：['2025', '01', '02', '0', '0', '0']
 * @returns {Date}
 */
export const arrayToDate = (arr): Date => {
  if (!Array.isArray(arr)) {
    return arr
  }
  const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = arr.map(Number) // 转换为数字
  return new Date(year, month - 1, day, hour, minute, second)
}
