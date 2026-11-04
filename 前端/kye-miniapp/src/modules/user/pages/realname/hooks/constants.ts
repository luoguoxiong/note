/**
 * 实名认证相关常量定义
 */

import auth from '@/modules/order-build/order-public/utils/auth'
import { IdType } from './type'

/** 客户类型 */
export const CUSTOMER_TYPE = {
  NORMAL: '10',
  JD: '20',
  COMMON: '30', // 公共后台
  INTERNAL: '40', // 内部专用
  FENCE: '90', // 围栏后台
} as const

/** 企业禁用标识 */
export const ENTERPRISE_DISABLE_FLAG = {
  DISABLED: '10',
  ENABLED: '20',
} as const

/** 认证类型 */
export const AUTH_TYPE = {
  PERSONAL: 'personal',
  ENTERPRISE: 'enterprise',
} as const

/** 认证状态 */
export const AUTH_STATUS = {
  NOT_AUTHENTICATED: 'not_authenticated',
  AUTHENTICATED: 'authenticated',
  DISABLED: 'disabled',
} as const

/** 图片 URL 常量 */
export const IMAGE_URLS = {
  PERSONAL_NORMAL: 'https://ic-img.ky-express.com/netc/20221124_38711160568_!!1669288850372_292_292.png',
  PERSONAL_FINISH: 'https://ic-img.ky-express.com/netc/20221202_18611160514_!!1669946049617_292_292.png',
  ENTERPRISE_NORMAL: 'https://ic-img.ky-express.com/netc/20221124_34911160565_!!1669288940279_292_292.png',
  ENTERPRISE_DISABLED: 'https://ic-img.ky-express.com/netc/20240110_4845840530_!!1704893432619_292_292.png',
  ENTERPRISE_FINISH: 'https://ic-img.ky-express.com/netc/20221124_8381116052_!!1669283014942_292_292.png',
  ARROW: 'https://ic-img.ky-express.com/netc/20231018_70261096531_!!1697610971098_12_22.png',
  ICON_FINISH_PERSONAL: 'https://ic-img.ky-express.com/netc/20221124_35911160534_!!1669283490213_204_96.png',
  ICON_FINISH_ENTERPRISE: 'https://ic-img.ky-express.com/netc/20221124_57611160548_!!1669284143182_204_96.png',
  REWARD_INTEGRAL: 'https://ic-img.ky-express.com/netc/20250422_19562366165_!!1745325023007_688_88.png',
  BG_PERSONAL: 'https://ic-img.ky-express.com/netc/20250603_11375182087_!!1748955243504_1388_660.png',
  BG_ENTERPRISE: 'https://ic-img.ky-express.com/netc/20250603_31175182091_!!1748955243506_1388_660.png',
} as const

/** 配置常量 */
export const CONFIG = {
  RELOAD_DELAY: 1000, // 重新加载延时
  TOOLTIP_DELAY: 1000, // 提示显示延时
  RELOAD_MESSAGE: '加载中',
  TOOLTIP_MESSAGE: '暂不支持企业实名认证，如有疑问请联系商务',
  DIALOG_TITLE: '温馨提示',
  DIALOG_CONFIRM: '我知道了',
  DEFAULT_DESCRIPTION: {
    PERSONAL:
      '用于个人实名认证，上传您的身份证信息即可完成实名认证。支持中国内地居民身份证、港澳台居民居住证、外国人永久居留身份证进行实名认证。',
    ENTERPRISE: '用于企业组织认证，完成认证后企业员工寄件时，可不用再单独认证。',
    DISABLED: '暂不支持企业实名认证',
  },
} as const

/** 认证卡片配置 */
export const AUTH_CARD_CONFIG = {
  PERSONAL: {
    name: '个人认证',
    authName: '您已完成个人认证',
    description: CONFIG.DEFAULT_DESCRIPTION.PERSONAL,
  },
  ENTERPRISE: {
    name: '企业认证',
    authName: '您已完成企业认证',
    description: CONFIG.DEFAULT_DESCRIPTION.ENTERPRISE,
  },
  DISABLED: {
    name: '企业认证',
    description: CONFIG.DEFAULT_DESCRIPTION.DISABLED,
  },
} as const

export interface IdTypeOption {
  label: string
  value: number
}

export const idTypeOptions: IdTypeOption[] = [
  { label: '居民身份证', value: IdType.RESIDENT_ID_NO },
  { label: '港澳台居民居住证', value: IdType.RESIDENT_GAT_ID_NO },
  { label: '外国人永久居留身份证', value: IdType.FOREIGNER_ID_NO },
]

export const IDCard =
  /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/

// 港澳台居民证件号正则
export const GatIDCard = /^(810000|820000|830000)\d{12}$/

// 外国人永久居留身份证正则
export const ForeignerIDCard = /^[A-Za-z0-9]{9,17}$/
