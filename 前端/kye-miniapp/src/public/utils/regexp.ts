/** 手机号码正则 */
const phoneRegex = /^1[3456789]\d{9}$/

export const createMatcher = (regexp: RegExp) => (string: string) => regexp.test(string)

export const createReplacer = (regexp: RegExp) => (string: string, replacement: string) =>
  string.replace(new RegExp(regexp), replacement)

/** 校验手机号码 */
export const isRealPhone = createMatcher(phoneRegex)
