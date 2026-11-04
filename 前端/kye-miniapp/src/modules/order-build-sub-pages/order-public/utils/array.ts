/**
 * @description 判断变量是否为空数组
 * @param listToCheck
 */
export const isEmptyArray = (listToCheck: unknown) => {
  return Array.isArray(listToCheck) && listToCheck.length === 0
}
