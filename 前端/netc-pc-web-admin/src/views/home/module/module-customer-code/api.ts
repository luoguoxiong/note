/**
 * 客户编码模块 API
 * 来源: customer-code/*.vue 引用的 @/services/module/user (netc-pc-web)
 * 接口的 service 方法名(headerUrl)与旧基座完全一致
 * 已在 @/apis/user 内的接口(getAppUserRelationAuth/queryCustomerInfo 等)直接复用
 */
import { http } from '@/utils/request/request'
import { getAppUserRelationAuth, getCustomerCodeBindInfo, queryCustomerInfo } from '@/apis/user'
import type { HttpResponse } from '@/utils/types'
import type { ApplyBindCustomerData, BindableCompanyList, RiskVerifyPayload, VirtualNumData } from './types'

/** 旧基座统一响应结构(含扩展字段) */
export type LegacyResponse<T = any> = HttpResponse<T> & Record<string, any>

/** req 选项 */
type ReqOptions = {
  /** 隐藏全局错误提示(错误码由业务层处理) */
  hideErrMsg?: boolean
  /** 不携带 token 头(对齐老请求层 token:false) */
  unToken?: boolean
  /** 携带风控验证码协议头(对齐老请求层 captcha:'captcha': 带此头后端返回 264587+风控data, 前端弹图形/滑块验证码) */
  riskVerify?: boolean
}

/** 风控协议头(老请求层 captcha:'captcha' 等价实现, 与 admin/components/user-info/api.ts 同款) */
const RISK_VERIFY_HEADERS = { 'x-risk-version': 'captcha' }

const req = <T = any>(apiCode: string, data: Record<string, any> = {}, options: ReqOptions = {}) => {
  const { hideErrMsg = false, unToken = false, riskVerify = false } = options
  return http<T>(apiCode, data, {
    retryCount: null,
    ...(hideErrMsg ? ({ toast: false } as any) : {}),
    ...(unToken ? ({ unToken: true } as any) : {}),
    ...(riskVerify ? ({ headers: RISK_VERIFY_HEADERS } as any) : {}),
  }) as Promise<LegacyResponse<T>>
}

// ==================== 绑码 ====================

/** 添加/更换客户编码绑定 web.uam.webUam.uamAppUser.bindCustomerCodeFromClient */
export const bindCustomerCodeByClient = (params: Record<string, any>) => {
  return req('web.uam.webUam.uamAppUser.bindCustomerCodeFromClient', params, { hideErrMsg: true, riskVerify: true })
}

/** 客户编码校验(风控弹窗场景) web.uam.customer.checkCustomerCode */
export const checkCustomerCode = (params: Record<string, any>) => {
  return req('web.uam.customer.checkCustomerCode', params, { hideErrMsg: true, riskVerify: true })
}

/** 查询可绑定公司列表(老 setCustomerListAction 数据源) web.uamAppUser.getUserBindableCompanyList */
export const getBindableCompanyList = () => {
  return req<BindableCompanyList>('web.uamAppUser.getUserBindableCompanyList', {})
}

/** 查询用户绑码关联权限(老 getAppUserRelationAuth action 数据源) */
export const getAppUserRelationAuthApi = getAppUserRelationAuth

/** 绑码数量上限校验(老 getCustomerCodeBindInfo) */
export const getCustomerCodeBindInfoApi = getCustomerCodeBindInfo

// ==================== 忘记密码 / 申请绑码 ====================

/** 申请绑定客户编码 web.uam.apply.applyBindCustomerFromClient */
export const applyBindCustomer = (params: Record<string, any>) => {
  return req<ApplyBindCustomerData>('web.uam.apply.applyBindCustomerFromClient', params)
}

/** 申请绑定客户编码入参校验(风控弹窗场景) web.uam.apply.applyBindCustomerParamCheck */
export const applyBindCustomerParamCheck = (params: Record<string, any>) => {
  return req('web.uam.apply.applyBindCustomerParamCheck', params, { hideErrMsg: true, riskVerify: true })
}

/** 手机号绑码是否对外隐藏 web.uam.userCenter.userBind.isWebHide */
export const userBindIsWebHide = () => {
  return req<{ isWebHide: number }>('web.uam.userCenter.userBind.isWebHide', {})
}

// ==================== 虚拟号 ====================

/** 获取虚拟号(忘记密码申请结果联系客服) web.uam.apply.getVirtualNum */
export const getVirtualNum = (params: Record<string, any>) => {
  return req<VirtualNumData>('web.uam.apply.getVirtualNum', params)
}

/** 获取商务虚拟号(申请客户编码结果联系客服) web.uam.apply.getMarketVirtualMobile */
export const uamGetBusinessVirtualMobile = (params: Record<string, any>) => {
  return req<VirtualNumData | string>('web.uam.apply.getMarketVirtualMobile', params)
}

/** 获取虚拟号(申请关联账号权限审核结果联系客服) web.uam.apply.getOtherBindVirtualNum */
export const getOtherBindVirtualNum = (params: Record<string, any>) => {
  return req<VirtualNumData>('web.uam.apply.getOtherBindVirtualNum', params)
}

/** 手机号黑名单联系人角色 web.uam.userCenter.userBlack.getBlackUserContactRole */
export const getBlackUserContactRole = (params: Record<string, any>) => {
  return req<{ role: number }>('web.uam.userCenter.userBlack.getBlackUserContactRole', params)
}

// ==================== 风控校验 ====================

/** 获取图形验证码 web.uam.riskVerify.getCheckInfo */
export const riskVerifyGetCheckInfo = (params: Record<string, any> = {}, unToken = false) => {
  return req<{ imgInfo: { base64: string } }>('web.uam.riskVerify.getCheckInfo', params, { unToken })
}

/** 风控校验确认 web.uam.riskVerify.userCheck */
export const riskVerifyUserCheck = (params: Record<string, any>, unToken = false) => {
  return req<{ safeVerifyId: string }>('web.uam.riskVerify.userCheck', params, { hideErrMsg: true, unToken })
}

/** 图形验证码 payload + 配置 */
export type RiskVerifyCheckPayload = RiskVerifyPayload

// ==================== 申请绑定其他公司(关联账号流程) ====================

/** 查询绑定其他公司申请详情(是否有申请中流程) web.uam.uamAppUser.getOtherBindApplyDetail */
export const getOtherBindApplyDetail = () => {
  return req('web.uam.uamAppUser.getOtherBindApplyDetail', {})
}

/** 申请绑定其他公司 web.uam.uamAppUser.bindOtherCustomerList */
export const bindOtherCustomerList = (params: Record<string, any>) => {
  return req('web.uam.uamAppUser.bindOtherCustomerList', params)
}

/** 一键解绑关联绑定公司 web.uam.webUam.uamAppUser.unbindRelationCustomerCode */
export const unbindRelationCustomerCode = (params: Record<string, any>) => {
  return req('web.uam.webUam.uamAppUser.unbindRelationCustomerCode', params)
}

/** 申请绑定其他公司编码校验 web.uam.apply.applyBindOtherCustomerCheck */
export const applyBindOtherCustomerCheck = (customer: string) => {
  return req('web.uam.apply.applyBindOtherCustomerCheck', { customer }, { hideErrMsg: true })
}

/** 获取前端推荐绑定公司列表(关联账号权限) web.uam.uamAppUserRelation.getFrontRecommendCustomer */
export const getFrontRecommendCustomer = () => {
  return req('web.uam.uamAppUserRelation.getFrontRecommendCustomer', {})
}

// ==================== 其它 ====================

/** 审批结果拨打电话-跨声消息 web.uam.contactsSync.approveAssAccount */
export const applyResultCallPhoneReportApi = (params: Record<string, any>) => {
  return req('web.uam.contactsSync.approveAssAccount', params)
}

/** 查询客户信息(绑码成功后刷新本地客户数据, 复用 @/apis/user 签名逻辑) */
export const queryCustomerInfoApi = queryCustomerInfo
