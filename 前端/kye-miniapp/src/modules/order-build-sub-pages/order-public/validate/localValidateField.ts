import { localCheckResult, popoverConfigType } from '@order-public-sub-public/types'

/**
 * 本地校验
 * @param key string 字段名
 * @param field string 字段值
 * @param rules Array 需要校验的规则
 * @returns Object
 */
const localValidateField = async (
  key: string,
  field: string,
  rules: { rule: RegExp; errorMessage: string }[],
  bubbleConfig?: popoverConfigType,
  // eslint-disable-next-line max-params
): Promise<localCheckResult> => {
  for (const { rule, errorMessage } of rules) {
    // console.log('key', key, 'field', field)
    if (!rule.test(field)) {
      return {
        key,
        passed: false,
        content: errorMessage,
        bubbleConfig,
      }
    }
  }
  return {
    key,
    passed: true,
    content: '',
    bubbleConfig,
  }
}

export default localValidateField
