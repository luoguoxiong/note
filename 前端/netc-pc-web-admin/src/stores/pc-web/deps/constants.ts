/**
 * 旧基座(netc-pc-web) 纯常量与纯逻辑移植层
 * 来源:
 *  - netc-pc-web/src/configs/order-auth.js
 *  - netc-pc-web/src/views/waybill/enum/queryEnum.js
 *  - netc-pc-web/src/views/permission-manage/enum/permissionEnum.js
 *  - netc-pc-web/src/views/permission-manage/hooks/useUam.js (角色判断纯逻辑)
 *  - netc-pc-web/src/views/micro-views/* (微前端视图配置)
 *
 * 使用场景: pc-web 各 Pinia store 引用这些常量/判断函数, 与旧基座行为完全一致
 */

// ==================== 下单权限配置 (旧 configs/order-auth.js) ====================

/** 公司地址簿 / 个人地址簿 */
export const ADDRESS_BOOK_FLAG = {
  COMPANY: '10', // 公司地址
  PERSON: '20', // 个人地址簿
} as const

/** 单票-编辑收件地址权限 */
export const EDIT_SINGLE_TICKET_RECEIVE_ADDRESS = {
  WITH_PERMISSION: '10',
  NO_PERMISSION: '20',
} as const

/** 单票-编辑寄件地址权限 */
export const EDIT_SINGLE_TICKET_SENDER_ADDRESS = {
  WITH_PERMISSION: '10',
  NO_PERMISSION: '20',
} as const

/** 批量-编辑寄件地址权限 */
export const EDIT_BATCH_TICKET_SENDER_ADDRESS = {
  WITH_PERMISSION: '10',
  NO_PERMISSION: '20',
} as const

/** 批量-编辑收件地址权限 */
export const EDIT_BATCH_TICKET_RECEIVE_ADDRESS = {
  WITH_PERMISSION: '10',
  NO_PERMISSION: '20',
} as const

// ==================== 权限管理 (旧 views/permission-manage/enum/permissionEnum.js) ====================

export const permissionRole = {
  AUTH: 10, // 主授权人
  ADMIN: 20, // 管理员
  NORMAL: 30, // 普通用户
} as const

export const permissionRoleMap = new Map([
  [10, '主授权人'],
  [20, '管理员'],
  [30, '普通用户'],
])

/** 左侧菜单-账号权限-新手引导提示 */
export const permissionMenuGuide = {
  // 未开通
  ['主授权管理员未开通部门']: '可在此进行成员管理、公司配置管理和审批管理',
  ['主授权管理员已开通部门']: '可在此进行成员与部门管理、公司配置管理和审批管理',
  ['部门负责人已开通部门']: '可在此进行成员管理和审批管理',
} as const

const userLevelName: Record<number, string> = { 1: '主管理员', 2: '副管理员', 3: '普通账户' }

/** 是否主授权号 (旧 useUam.uam_is_auth) */
export const uam_is_auth = (role: number | string | undefined | null): boolean => {
  return role === permissionRole.AUTH
}

/** 是否管理员 (旧 useUam.uam_is_admin) */
export const uam_is_admin = (role: number | string | undefined | null): boolean => {
  return role === permissionRole.ADMIN
}

/** 是否普通用户 (旧 useUam.uam_is_normal) */
export const uam_is_normal = (role: number | string | undefined | null): boolean => {
  return role === permissionRole.NORMAL || !role
}

/** 是否管理者(主/副管理员) (旧 useUam.uam_auth_isManager -> permissionServe 同名实现) */
export const uam_auth_isManager = (userExternalType: number): boolean => {
  return !!userLevelName[userExternalType]
}

/** 通用权限用户标识描述 (旧 useUam.uam_user_type) */
export const uam_user_type = (userExternalType: number): string | null => {
  return uam_auth_isManager(userExternalType) ? userLevelName[userExternalType] : null
}

// ==================== 微前端视图配置 (旧 views/micro-views/*) ====================

/** 查看他人运单(基于 M3060 生成, 不注册到后端) */
export const otherWaybillConfig = {
  applicationCode: 'PC_WEB_WAYBILL_OTHER',
  menuName: '查看他人运单',
  routePath: '#/admin/other-waybill-v3',
  menuCode: 'M-WAYBILL-OTHER',
}

/** 查看运单资料(基于 M3060 生成) */
export const waybillMaterialConfig = {
  applicationCode: 'PC_WEB_WAYBILL_MATERIAL',
  menuName: '查看运单资料',
  routePath: '#/admin/waybill-material',
  menuCode: 'M-WAYBILL-MATERIAL',
}

/** 实名认证(基于 M3081 生成) */
export const realnameConfig = {
  applicationCode: 'PC_WEB_TOOLS_NEW',
  menuName: '实名认证',
  routePath: '#/admin/realname',
  menuCode: 'M-TOOLS-REALNAME',
}

/** 电子合同(独立轻应用) */
const prodUrl = 'uc.ky-express.com'
const isProdHost = typeof location !== 'undefined' && location.host.includes(prodUrl)
const key = !isProdHost ? '-uat' : ''

export const electronicContractConfig = {
  applicationCode: 'CRM-ELECTRONIC-SIGN',
  menuName: '电子合同',
  routePath: '#/home',
  menuCode: 'CRM-ELECTRONIC-SIGN',
  loadAddress: `https://crm-h5${key}.ky-express.com/crm-electronic-sign/electronic-sign.html`,
}

/** 整车运单(基于 M3058 生成) */
export const vtsConfig = {
  applicationCode: 'H5_COMPLETE_VEHICLE',
  menuName: '整车运单',
  routePath: '#/admin/vts-waybill',
  menuCode: 'VTS-WAYBILL',
}

export const vtsDetailConfig = {
  applicationCode: 'H5_COMPLETE_VEHICLE',
  menuName: '整车运单',
  routePath: '#/admin/vts-waybill-detail',
  menuCode: 'VTS-WAYBILL-DETAIL',
}
