/** 手机号正则 */
export const phone = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/
/** 手机号支持虚拟号正则 */
export const virtualPhone = /^1[3|4|5|6|7|8|9][0-9]\d{8}\d{0,4}$/
/** 手机虚拟号正则 */
export const virtualPhoneOnly = /^1[3|4|5|6|7|8|9][0-9]\d{8}-\d{1,4}$/

/** 固话正则 */
export const tel =
  /((^[0|4|8]\d{10,11}$)|^((\d{7,8})|([0|4|8](\d{2,3}))-?(\d{7,8})|([0|4|8](\d{2,3}))-?(\d{7,8})-(\d{1,7})|(\d{7,8})-(\d{1,7}))$)/

/** 固话正则 */
export const telephoneNew = /\d{3}-?\d{4,9}|\d{4}-?\d{3,8}/
/** 固话允许小灵通正则 */
export const telephoneMobile = /^1\d{10}$/

/** 身份证正则 */
export const IDCard =
  /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/

/** 不包含敏感文字，"先生", "小姐", "女士" */
export const sensitiveWords = /^(?!.*先生.*|.*小姐.*|.*女士.*)/

/** 非纯数字 */
export const notPureNumber = /^.*[^\d].*$/

// 只能输入数字
export const TELEPHONE_INPUT_REGEXP = /^[0-9-]{0,15}$/

// 唯品会校验
export const VIP_SHOP_CODE_REGEXP = /^[0-9]{10}-[0-9]{4}$/

// 纯数字或者-
export const VIP_SHOP_CODE_REX = /^[A-Z-0-9]+$/

/* eslint-disable-next-line */
export const filterEmojis =
  // eslint-disable-next-line no-misleading-character-class, no-useless-escape
  /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi

// 检查是否 ip
export const ipExp = /(\d{1,3}\.){3}\d{1,3}/

//邮箱
export const ipEmail = /@/

//过滤所有空格
export const filterAllSpace = /\s*/g

//（符号+数字）取反
/* eslint-disable-next-line */
export const symbolNumber = /^(?![.()【】·`@#$^&*=|{}。（）!！；;'',，、?？《》\\\-\\[\]<>\/\s\d]*$).*$/

// 不能为空
export const notEmpty = /^(?!$|null|-1$).+/
//为空
export const Empty = /^$/

// 至少两个字符
export const lessTwoCharacters = /^.{2,}$/

//大于0的数
export const overZero = /^[1-9]*[1-9][0-9]*$/

//过滤特殊字符
export const specialFilter =
  /[`~!@#$%^&*()_\-+=<>?:"{}.'[\]·~！@#￥%……&*（）——\-+={}《》？：“”【】、；‘'。、〈〉√［］〔〕]/g

//横线斜线
export const lineFilter = /[,\\/;|｜／＼， ]/g

//中文
export const pwdPatter = /[\u4e00-\u9fa5]/g

//
export const wareHouse = /[^a-zA-Z\d\u4e00-\u9fa5,，;；\\、|/／＼ ]/g

// 手机号正则校验，如：18814378965-1234
export const mobileRule = /^(1[3|4|5|6|7|8|9][0-9]\d{8})(?:-(\d{1}|\d{2}|\d{3}|\d{4}))?$/

// 固定电话正则校验, 如：18814378687、0755-28689956、010-28689982、86251467
// eslint-disable-next-line
// export const telephoneRule =
//   /^(?:(?:(1[3|4|5|6|7|8|9][0-9]\d{8}))|(?:0\d{2}-?\d{8})|(?:0\d{3}-?\d{8})|(?:0\d{2}-?\d{7})|(?:0\d{3}-?\d{7})|(?:\d{8})|(?:\d{7}))$/
export const telephoneRule =
  /^(?:(?:(1[3|4|5|6|7|8|9][0-9]\d{8}))|(?:0\d{2}-?\d{8})|(?:0\d{3}-?\d{8})|(?:0\d{2}-?\d{7})|(?:0\d{3}-?\d{7})|(?:^(?!400|800)\d{7,8})|(?:[48]00-?\d{5,10}))$/

export const detailRule = /^.{11,}$/

export const numberRule = /[^0-9,，]/gi

export const onlyNumber = /^\d+$/
