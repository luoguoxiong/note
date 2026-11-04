export const filterChinese = (value = '', unit = '元') => {
  if (Number(value) < 10000) {
    return value
  } else if (Number(value) < 100000000) {
    // 如果数值小于 1 亿，按万为单位处理
    const prefixNumber = parseInt((Number(value) / 10000).toString())
    const suffixNumber = parseFloat(value.toString().substring(prefixNumber.toString().length))
    const suffixString = suffixNumber.toString()
    const hasZero = suffixString.length === 1 ? '零' : ''
    return prefixNumber + '万' + (suffixNumber > 0 ? `${hasZero}${suffixNumber}` : '') + unit
  } else {
    // 如果数值大于等于 1 亿，按亿为单位处理
    const numValue = Number(value)
    const prefixNumber = parseInt((numValue / 100000000).toString())
    const remainingValue = numValue % 100000000

    if (remainingValue < 10000) {
      // 剩余数值小于 1 万的情况
      return prefixNumber + '亿' + (remainingValue === 0 ? '' : remainingValue) + unit
    } else {
      // 剩余数值大于等于 1 万的情况
      const wanPrefixNumber = parseInt((remainingValue / 10000).toString()).toString()
      // 向前面补0，删除后面的0
      const _wanPrefixNumber = ('0'.repeat(4 - wanPrefixNumber.length) + wanPrefixNumber)?.replace(/0+$/, '')

      const wanSuffixNumber = remainingValue % 10000

      return prefixNumber + '.' + _wanPrefixNumber + '亿' + (wanSuffixNumber === 0 ? '' : wanSuffixNumber) + unit
    }
  }
}
