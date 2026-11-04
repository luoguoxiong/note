/**
 * 旧基座(netc-pc-web) API 适配层
 * 来源:
 *  - netc-pc-web/src/services/api/*.js
 *  - netc-pc-web/src/services/module/user.js
 *  - netc-pc-web/src/api/* (@api 别名 -> src/services/api)
 *
 * 使用场景:
 *  - pc-web 各 Pinia store 的 action 内部调用, 接口的 service 方法名(headerUrl)与旧基座完全一致
 *  - hideErrMsg 映射为新请求层的 toast:false; requestProxy/versionFlag/token:false 等旧特性
 *    新请求层暂无对应能力, 已在具体函数注释中标注
 */
import { http } from '@/utils/request/request'
import type { HttpOptions } from '@/utils/types'
import * as storage from './storage'

/** 旧基座统一响应结构 */
export interface LegacyResponse<T = any> {
  code: number
  data: T
  msg?: string
  [key: string]: any
}

/** 旧请求选项(hideErrMsg -> toast:false) */
const req = <T = any>(apiCode: string, data: Record<string, any> = {}, hideErrMsg = false) => {
  return http<T>(apiCode, data, {
    retryCount: 0,
    ...(hideErrMsg ? ({ toast: false } as HttpOptions) : {}),
  }) as Promise<LegacyResponse<T>>
}

// ==================== 用户服务 (旧 services/module/user.js) ====================

/** web.ssoUser.getUserInfoByPhoneNew 获取用户信息(默认 from=6) */
export const getUserInfoByPhoneNew = (from = 6) => {
  return req('web.ssoUser.getUserInfoByPhoneNew', { from })
}

/** web.v2.userRealName.checkAuth 实名认证校验 */
export const checkRealNameAuth = () => {
  return req('web.v2.userRealName.checkAuth', {})
}

/** web.v2.userRealName.getAuthDetail 实名认证详细信息(旧 api/realNameVerify.queryVerifyStatusInfo) */
export const queryVerifyStatusInfo = () => {
  return req('web.v2.userRealName.getAuthDetail')
}

/** web.uamAppUser.getUserBindableCompanyList 获取可绑定的公司列表 */
export const getBindableCompanyList = () => {
  return req('web.uamAppUser.getUserBindableCompanyList', {})
}

/** web.login.switch.getSwitchList 切换登录手机号列表 */
export const getLoginSwitchList = (params: Record<string, any>) => {
  return req('web.login.switch.getSwitchList', params)
}

/** web.uam.uamAppUser.getUnionBindCountAndLimit 用户关联绑定上限及数量 */
export const getCustomerCodeBindCountAndLimit = () => {
  return req('web.uam.uamAppUser.getUnionBindCountAndLimit', {})
}

/** web.uam.uamAppUserRelation.getBindInfo 是否有关联账号权限/绑码信息 */
export const getAppUserRelationAuth = () => {
  return req('web.uam.uamAppUserRelation.getBindInfo', {})
}

/** web.advertisement.softwareTheme.getDetail 软件主题配置 */
export const getSoftwareTheme = () => {
  return req('web.advertisement.softwareTheme.getDetail', {})
}

/** web.login.weChatBind.searchBindResult 微信绑定结果查询 */
export const searchBindResult = (params: Record<string, any>) => {
  return req('web.login.weChatBind.searchBindResult', params)
}

// ==================== 通用 (旧 services/api/common.js) ====================

/** web.order.getDataDictionaryByCode 查询数据字典 */
export const queryDataDictionary = (dictionaryCode: string) => {
  return req('web.order.getDataDictionaryByCode', { dictionaryCode })
}

/** web.order.customer.getKaCustomerMapping 获取ka客户自定义编码 */
export const getKaCustomerMapping = () => {
  const data = {
    customerCode: storage.getCustomerCode(),
    source: '20',
    page: 1,
    pageSize: 20,
  }
  return req('web.order.customer.getKaCustomerMapping', data, true)
}

/** client.authorization.list 老版权限ID列表 */
export const getUserPermissionApi = () => {
  return req('client.authorization.list', { phone: storage.getPhone() })
}

/** web.uam.permission.getReportAuth 新版权限数据 */
export const getUserPermissionNewApi = () => {
  return req('web.uam.permission.getReportAuth', { phone: storage.getPhone() })
}

/** web.uam.net.permission.listByPhone UAM权限code列表 */
export const getUamPermissionList = () => {
  return req('web.uam.net.permission.listByPhone', {})
}

/** PC-GetPrintSet 查询打印配置 */
export const getPrintConfigApi = () => {
  return req('PC-GetPrintSet', { mobile: storage.getPhone() }, true)
}

/** web.v2.printBasic.templateList 打印模板列表 */
export const getTemplateListApi = () => {
  return req('web.v2.printBasic.templateList', { mobile: storage.getPhone() })
}

/** web.order.getRequirementNew 下单默认要求配置(默认保价/回单标识/子母单) */
export const getRequirementNew = () => {
  return req('web.order.getRequirementNew', {}, true)
}

/** web.order.waybillEncryptConfig.queryByCondition 查询打印面单加密规则 */
export const getEncryptInfo = () => {
  return req('web.order.waybillEncryptConfig.queryByCondition', { customerCodes: [storage.getCustomerCode()] })
}

// ==================== 寄件 (旧 services/api/shipment.js) ====================

/** E-GetPayWay 付款方式 */
export const queryPaymentTypes = () => {
  return req('E-GetPayWay', {
    companyNo: storage.getCustomerCode(),
    mobile: storage.getPhone(),
  })
}

// ==================== 设置中心 (旧 services/api/setting.js) ====================

/** web.order.config.getSendDefaultConfig 下单默认配置 */
export const queryDefaultConfig = (params: Record<string, any> = {}) => {
  return req('web.order.config.getSendDefaultConfig', params)
}

/** web.order.getPrintConfigure 打印机信息 */
export const getPrintSet = () => {
  return req('web.order.getPrintConfigure', {})
}

/** web.client.printCustomerFlag.search 打印定制样式3(收、寄件公司) */
export const queryPrintCompanyFlag = (params: Record<string, any>) => {
  return req('web.client.printCustomerFlag.search', params)
}

/** web.client.printCompanyLabel.search 打印定制样式2(收件公司、货品编码) */
export const queryPrintCompanyGoodsFlag = (params: Record<string, any>) => {
  return req('web.client.printCompanyLabel.search', params)
}

// ==================== 权限管理 UAM (旧 services/api/permission.js) ====================

/** web.uam.net.appUser.getUserInfo UAM-net-获取当前用户信息 */
export const uam_userInfo = ({ phone, hideErrMsg = false }: { phone?: string; hideErrMsg?: boolean } = {}) => {
  return req('web.uam.net.appUser.getUserInfo', { phone }, hideErrMsg)
}

/** web.uam.net.uamUserClient.net.getCurrentUserDetail UAM-net-获取当前用户详情(v2.0) */
export const uam_getCurrentUserDetail = (params: Record<string, any> = {}) => {
  return req('web.uam.net.uamUserClient.net.getCurrentUserDetail', params)
}

/** web.uam.appUser.net.checkCustomerPasswordSecurity 检查客户编码密码安全性 */
export const uam_checkCustomerPasswordSecurity = (params: Record<string, any> = {}) => {
  return req('web.uam.appUser.net.checkCustomerPasswordSecurity', params)
}

/** web.uam.userCenter.Config.getButtonConfig 查询公司禁用按钮配置 */
export const uam_getButtonConfig = (params: Record<string, any> = {}) => {
  return req('web.uam.userCenter.Config.getButtonConfig', params, true)
}

/** web.uam.net.uamUserClient.net.getRoleAndApplyCount 审批管理-角色与申请数量 */
export const uam_getRoleAndApplyCount = (params: Record<string, any> = {}) => {
  return req('web.uam.net.uamUserClient.net.getRoleAndApplyCount', params)
}

/** web.uam.uamUserClient.net.getApprovalApplyAndWaybillCount 审批管理-申请+运单待审批数量 */
export const uam_getApprovalApplyAndWaybillCount = (params: Record<string, any> = {}) => {
  return req('web.uam.uamUserClient.net.getApprovalApplyAndWaybillCount', params, true)
}

/** web.uam.net.appUser.getUnAuditCountInfo 权限整合-各tab未审批数量 */
export const uam_api_getUnAuditCountInfo = (params: Record<string, any> = {}) => {
  return req('web.uam.net.appUser.getUnAuditCountInfo', params, true)
}

/** web.uam.config.getButtonInfo 权限按钮控制列表(旧为 requestProxy 代理请求) */
export const uam_getButtonInfo = (params: Record<string, any> = {}) => {
  return req('web.uam.config.getButtonInfo', params)
}

/** web.uam.userCenter.department.getMoreDepartment 侧边栏部门列表(旧 services/api/admin.js) */
export const uamDepartmentGetMoreDepartment = (params: Record<string, any> = {}) => {
  return req('web.uam.userCenter.department.getMoreDepartment', params, true)
}

// ==================== 付款授权 (旧 services/api/paymentAuthorization.js) ====================

/** web.uam.payAuth.getUnAuthCount 菜单付款授权待审批数量 */
export const web_uam_payAuth_getUnAuthCount = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.getUnAuthCount', params)
}

/** web.uam.payAuth.getUserListPermission 是否有查看待审批、授权记录列表的权限 */
export const web_uam_payAuth_getUserListPermission = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.getUserListPermission', params)
}

/** web.uam.payAuth.tabCount tab数量统计 */
export const web_uam_payAuth_tabCount = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.tabCount', params)
}

/** web.uam.payAuth.identityCheck 给他人授权-身份校验 */
export const web_uam_payAuth_identityCheck = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.identityCheck', params)
}

/** web.uam.payAuth.hasWaybillApplication 是否有待用户审批的运单申请 */
export const web_uam_payAuth_hasWaybillApplication = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.hasWaybillApplication', params)
}

/** web.uam.payAuth.isBoundPayCustomerCode 是否绑定了对应的付款编码 */
export const web_uam_payAuth_isBoundPayCustomerCode = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.isBoundPayCustomerCode', params)
}

/** web.uam.payAuth.checkUserBindingInfo 校验是否有当前绑定公司 */
export const web_uam_payAuth_checkUserBindingInfo = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.checkUserBindingInfo', params)
}

/** web.uam.payAuth.isBoundGrantAuthCustomerCode 是否绑定了对应的被授权公司编码 */
export const web_uam_payAuth_isBoundGrantAuthCustomerCode = (params: Record<string, any> = {}) => {
  return req('web.uam.payAuth.isBoundGrantAuthCustomerCode', params)
}

// ==================== 消息中心 (旧 services/api/messageCenterApi.js) ====================

/** web.advertisement.userMessage.getUnreadCountNew 未读消息数 */
export const userMessage_getUnreadCount_new = (params: Record<string, any>) => {
  return req('web.advertisement.userMessage.getUnreadCountNew', params)
}

// ==================== 统计分析 (旧 services/api/total.js) ====================

/** web.report.report.reportAuthor 获取客户报表权限(旧实现入参被忽略, 保持一致) */
export const getByMobile = () => {
  return req('web.report.report.reportAuthor', {})
}

// ==================== 供应商 (旧 services/api/supplier.js) ====================

/** web.supplier.supplierInfo.search 查询供应商列表 */
export const getSupplierList = (params: Record<string, any>) => {
  return req('web.supplier.supplierInfo.search', params)
}

/** 是否存在供应商信息 */
export const existSupplierInfo = async (): Promise<boolean> => {
  const params = {
    page: 1,
    pageSize: 1,
  }
  const res = await getSupplierList(params)
  return res.code === 0 && res.data.rowTotal > 0
}

// ==================== 预存运费 (旧 services/api/depositFreight.js) ====================

/** gw.prestore.storeReserveBalance 余额折扣信息 */
export const storeReserveBalance = () => {
  return req('gw.prestore.storeReserveBalance', {
    companyName: storage.getCustomerShortName() || storage.getCustomerName(),
  })
}

/** web.kyexpress.recharge.getActivity 充值活动信息 */
export const getActivity = () => {
  return req('web.kyexpress.recharge.getActivity', { customerCode: storage.getCustomerCode() })
}

/** web.kyexpress.payPassword.isManager 当前用户是否为公司密码管理员 */
export const getIsManager = () => {
  return req('web.kyexpress.payPassword.isManager', {})
}

/** web.advertisement.getDetails 广告中心详情(预存运费主题图片) */
export const getAdvertisementDetails = (params: Record<string, any>) => {
  return req('web.advertisement.getDetails', params)
}
