/**
 * 正则工具(局部化)
 * 来源: customer-code/*.vue 引用的 @utils/regular (netc-pc-web/src/utils/regular.js)
 * 仅迁移本模块用到的正则
 */

/** 手机号 */
export const mobileNumber = /^1[3456789]\d{9}$/

/** 仅中文 */
export const chineseOnly = /^[\u2E80-\uFE4F]+$/

/** emoji 表情 */
/* eslint-disable no-misleading-character-class, no-useless-escape */
// prettier-ignore
export const emoji = /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi
/* eslint-enable no-misleading-character-class, no-useless-escape */
