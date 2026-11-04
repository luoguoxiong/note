/**
 * 金额格式化
 * @param num 金额
 * @param precision 小数点位数
 * @returns string
 */
export const decimal = (num: number | string, precision = 2) => {
  const curNum = +num
  if (typeof curNum !== 'number' && !curNum) {
    return ''
  }
  if (typeof curNum === 'string' || isNaN(curNum)) {
    return num
  }
  return `${(+curNum).toFixed(precision).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,')}`
}

// 提取为纯文本
export const htmlToPlainText = (html: string) => {
  if (!html) return ''
  let text = html.replace(/<script.*?>[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style.*?>[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<[^>]+>/g, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text
}
