/**
 * 正则表达式常量定义
 */

/** 手机号正则（11位，1开头） */
export const PHONE_REGEX = /^1[3-9]\d{9}$/

/** 座机号正则（支持区号+号码，可选横杠） */
export const LANDLINE_REGEX = /^0\d{2,3}-?\d{7,8}$/

/** 客户编码格式校验（数字或字母组合） */
export const CUSTOMER_CODE_REGEX = /^[a-zA-Z0-9]+$/

/** 姓名校验（仅允许中英文，不允许特殊字符） */
export const NAME_REGEX = /[^\u4e00-\u9fa5a-zA-Z]/g

/** 密码校验（仅允许字母和数字） */
export const PASSWORD_REGEX = /[^a-zA-Z0-9]/g

/** 最大姓名长度 */
export const MAX_MEMBER_NAME_LENGTH = 20

/** 客户编码最大长度 */
export const MAX_CUSTOMER_CODE_LENGTH = 20

/** 密码最大长度 */
export const MAX_PASSWORD_LENGTH = 50
