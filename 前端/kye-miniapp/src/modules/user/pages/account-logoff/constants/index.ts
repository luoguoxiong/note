/* 空格正则 */
export const trimReg = /\s*/g
/* emoji正则 */
export const emojiReg =
  /(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]|[0-9*#]\uFE0F\u20E3|[0-9#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|\u00A9|\u00AE|\u3030)/gi
/* 中文正则 */
export const zhReg = /[\u4e00-\u9fa5]/gi
/* 登录失效错误code码数组 */
export const EXPIRE_CODE_ARR = [100201, 5005]
/* 登录失效错误code码 */
export const ERROR_EXPIRE_CODE = 100201
