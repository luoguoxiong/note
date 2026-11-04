/**
 * header 相关枚举
 * 来源: netc-pc-web/src/enum/admin.js (ADVERTISEMENT_TYPE_ENUM / ADVERTISEMENT_JUMPMODE_ENUM)
 */

/** 广告类型 */
export const ADVERTISEMENT_TYPE_ENUM = Object.freeze({
  BANNER: '10', // banner
  POPPER: '20', // 弹窗
  MARQUEE: '30', // 走马灯
  OPEN_PAGE: '40', // 开屏页
})

/** 广告跳转方式 */
export const ADVERTISEMENT_JUMPMODE_ENUM = Object.freeze({
  NONE: 0, // 不跳转
  H5: 1, // H5
  NORMAL: 2, // 原生
  WX: 3, // 微信小程序
})
