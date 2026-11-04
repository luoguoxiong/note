/**
 * 判断两个字符串数组是否包含相同的元素
 * @param {string[]} arr1 第一个字符串数组
 * @param {string[]} arr2 第二个字符串数组
 * @returns {boolean} 如果两个数组包含相同的元素（无论顺序如何），则返回 true，否则返回 false
 */
export function arraysContainSameElements(arr1: string[], arr2: string[]) {
  if (arr1.length !== arr2.length) return false

  const frequencyCounter1: { [key: string]: number } = {}
  const frequencyCounter2: { [key: string]: number } = {}

  for (const val of arr1) {
    frequencyCounter1[val] = (frequencyCounter1[val] || 0) + 1
  }

  for (const val of arr2) {
    frequencyCounter2[val] = (frequencyCounter2[val] || 0) + 1
  }

  for (const key in frequencyCounter1) {
    if (frequencyCounter1[key] !== frequencyCounter2[key]) {
      return false
    }
  }

  return true
}
