/**
 * 客户编码模块 API 接口封装
 *
 * 从 H5 项目 (netc-customer-code) 迁移的 21 个 API 接口
 * 参考实名认证模块 (realname) 实现规范
 *
 * 所有接口统一使用 { appkey: 55262 } 作为第三个配置参数
 */
import { http } from '@public/utils/request'
import { getEnvConfig } from '@/public/config'
export const getProjectInfo = {
  source: getEnvConfig().isApp ? 26 : 25,
}

import type {
  CommonData,
  ConfigResponse,
  AppUserRelationAuthResponse,
  BindableCompanyListResponse,
  UserBindCustomerCodeResponse,
  CheckCustomerCodeResponse,
  BlackUserContactRoleResponse,
  UnbindResponse,
  UserRoleResponse,
  OtherBindApplyDetailResponse,
  CheckInfoResponse,
  UserCheckResponse,
  RegisterGuidePageResponse,
  LogoutTipResponse,
  VirtualNumResponse,
  MarketVirtualContactResponse,
  UserInfoByPhoneResponse,
  WebHideResponse,
  ApplicationInfoListResponse,
  DepartmentListResponse,
  ChangeDepartmentResponse,
  FrontRecommendCustomerResponse,
  ApplyBindOtherCheckResponse,
  BindOtherCustomerListResponse,
  BatchCheckBlackResponse,
  WechatQRCodeResponse,
} from './types'

// const appkey = 55262
const appkey = undefined

/**
 * 获取配置信息
 */
export const getConfig = (params?: CommonData) => {
  return http<ConfigResponse>('web.uam.scanQrcode.getConfig', params, { appkey })
}

/**
 * 获取是否有关联绑定权限
 */
export const getAppUserRelationAuth = (params?: CommonData) => {
  return http<AppUserRelationAuthResponse>('web.uam.uamAppUserRelation.getAppUserRelationAuth', params, { appkey })
}

/**
 * 获取可绑定的公司列表
 *
 * @returns { companyInfoList: CompanyInfo[], type: number }
 *   - type: 121=绑定, 110/111/122=切换, 120/10=更换
 */
export const getBindableCompanyList = (params?: CommonData) => {
  return http<BindableCompanyListResponse>('web.uamAppUser.getUserBindableCompanyList', params, { appkey })
}

/**
 * 绑定客户编码（核心接口）
 *
 * @param params - 绑定参数
 * @param params.customerCode - 客户编码
 * @param params.customerPwd - 客户密码
 * @param params.memberName - 姓名（选填）
 * @param params.type - 绑定类型: 0=绑定, 3=更换, 1=切换
 * @param params.source - 来源渠道
 * @param params.deviceCode - 设备编码
 * @param params.cancelApplyFlag - 是否取消申请（重复绑定时）
 * @param params.safeVerifyId - 安全验证ID（图形验证码）
 */
export const userBindCustomerCode = (params: {
  customerCode: string
  customerPwd: string
  memberName?: string
  type?: number
  source?: string
  deviceCode?: string
  cancelApplyFlag?: boolean
  safeVerifyId?: string
}) => {
  return http<UserBindCustomerCodeResponse>(
    'web.uam.webUam.uamAppUser.bindCustomerCodeFromClient',
    {
      ...params,
      operatorSource: getProjectInfo.source || '',
    },
    { appkey, hideToast: true, extraHeader: { 'x-risk-version': 'captcha' } },
  )
}

/**
 * 校验客户编码（含风控校验）
 *
 * @param params.customerCode - 客户编码
 * @param params.deviceType - 设备类型
 * @param params.safeVerifyId - 安全验证ID（腾讯验证码）
 * @throws 错误时抛出异常，code: 264587(需验证), 34000(拉黑), 100201(未登录), 111227(冻结)
 */
export const checkCustomerCode = (params: { customerCode: string; deviceType?: string; safeVerifyId?: string }) => {
  return http<CheckCustomerCodeResponse>('web.uam.customer.checkCustomerCode', params, {
    appkey,
    hideToast: true,
    extraHeader: { 'x-risk-version': 'captcha' },
  })
}
/**
 * 获取黑名单联系人角色（V1.0）
 *
 * @param params.customerCode - 客户编码
 * @returns 包含 role 字段用于 roleEnum 映射
 */
export const getBlackUserContactRole = (params: { customerCode: string }) => {
  return http<BlackUserContactRoleResponse>('web.uam.userCenter.userBlack.getBlackUserContactRole', params, { appkey })
}

/**
 * 一键解绑
 *
 * @param params.unbindList - 要解绑的客户编码列表
 */
export const unbindRelationCustomerCode = (params: { unbindList: string[] }) => {
  return http<UnbindResponse>(
    'web.uam.webUam.uamAppUser.unbindRelationCustomerCode',
    {
      ...params,
      operatorSource: getProjectInfo.source || '',
    },
    { appkey },
  )
}

/**
 * 解除绑定客户编码（单个）
 *
 * @param params.customerCode - 客户编码
 */
export const unBindCustomerCode = (params: { customerCode: string }) => {
  return http<UnbindResponse>(
    'web.uam.uamAppUser.unbindByCustomerCode',
    {
      ...params,
      operatorSource: getProjectInfo.source || '20',
    },
    { appkey },
  )
}

/**
 * 获取当前角色-解绑判断是否弹窗提示清角色和权限
 *
 * @param params.customerCode - 客户编码
 * @returns 包含 msg 提示消息
 */
export const getUserRoleByCustomerCode = (params: { customerCode: string }) => {
  return http<UserRoleResponse>('web.uam.uamAppUser.getUserRoleByCustomerCode', params, { appkey })
}

/**
 * 获取绑定其他公司申请详情明细
 *
 * @returns 包含 applyStatus 状态
 */
export const getOtherBindApplyDetail = () => {
  return http<OtherBindApplyDetailResponse>('web.uam.uamAppUser.getOtherBindApplyDetail', undefined, { appkey })
}

/**
 * 风控获取检验信息
 */
export const getCheckInfo = (params?: CommonData) => {
  return http<CheckInfoResponse>('web.uam.riskVerify.getCheckInfo', params, { appkey })
}

/**
 * 用户验证检测信息
 *
 * @returns 包含 safeVerifyId
 */
export const getUserCheck = (params?: CommonData) => {
  return http<UserCheckResponse>('web.uam.riskVerify.userCheck', params, { appkey })
}

/**
 * 账号密码登录-查询落地页配置页面
 *
 * @param params.source - 来源：1=原生，2=H5
 * @param params.registerFlag - 是否新注册用户：0=否，1=是
 * @returns 配置列表数组
 */
export const getRegisterGuidePage = (params: { source: number; registerFlag: number }) => {
  return http<RegisterGuidePageResponse>('web.login.guidePage.getRegisterGuidePage', params, { appkey })
}

/**
 * 登出提示
 *
 * @param params.withoutToken - 是否不带token
 * @returns 包含 tips 字段
 */
export const logoutTip = (params: CommonData & { withoutToken?: boolean }) => {
  return http<LogoutTipResponse>('web.login.logoutTip', { ...params, withoutToken: true }, { appkey })
}

/**
 * 获取市场虚拟号及企业微信（用户手动修改呼出手机号）
 *
 * @param params.customer - 客户编码
 * @param params.outPhone - 呼出手机号
 * @param params.from - 来源
 * @param params.needVerifyAuthName - 是否需要验证实名
 * @returns 包含 needRealName 是否需要实名
 */
export const getVirtualNum = (params: {
  customer: string
  outPhone: string
  from: string
  needVerifyAuthName?: boolean
}) => {
  return http<VirtualNumResponse>('web.uam.apply.getVirtualNum', params, { appkey })
}

/**
 * 根据手机号查询用户信息(新)
 *
 * 注意：根据 expressType 动态选择 apiCode
 * - 领鲜商城: web.uam.userCenter.checkRegister
 * - 其他: web.ssoUser.getUserInfoByPhoneNew
 *
 * @param params.phone - 手机号
 * @param params.from - 来源（默认6）
 * @param params.expressType - 快递类型（可选，'领鲜商城' 时使用不同API）
 */
export const getUserInfoByPhoneNew = (params: { phone: string; from?: number; expressType?: string }) => {
  // 根据 expressType 选择不同的 API
  const apiCode =
    params.expressType === '领鲜商城' ? 'web.uam.userCenter.checkRegister' : 'web.ssoUser.getUserInfoByPhoneNew'

  const from = params.from ?? 6
  return http<UserInfoByPhoneResponse>(apiCode, { ...params, from }, { appkey })
}

/**
 * 忘记密码-是否是外部隐藏用户
 *
 * @returns isWebHide: 1=隐藏
 */
export const userBindIsWebHide = (params?: CommonData) => {
  return http<WebHideResponse>('web.uam.userCenter.userBind.isWebHide', params, { appkey })
}

/**
 * 区域-菜单-轻应用列表接口
 *
 * @returns 包含 vos 数组
 */
export const gatApplicationInfoList = (params?: CommonData) => {
  return http<ApplicationInfoListResponse>('web.user.lightApplication.getCustomApplicationList', params, { appkey })
}

/**
 * 查询用户所在部门
 *
 * @param params.phone - 手机号
 * @param params.customerCode - 客户编码
 * @returns 部门列表数组，每个元素包含 current 标识当前部门
 */
export const getMoreDepartment = (params?: { phone?: string; customerCode?: string }) => {
  return http<DepartmentListResponse>('web.uam.userCenter.department.getMoreDepartment', params, { appkey, hideToast: true })
}

/**
 * 切换当前部门
 *
 * @param params.toDepartmentCode - 目标部门编码
 * @param params.customerCode - 客户编码
 * @param params.source - 来源（可选）
 */
export const changeCurrentDepartment = (params: {
  toDepartmentCode: string
  customerCode: string
  source?: number
}) => {
  return http<ChangeDepartmentResponse>(
    'web.uam.userCenter.department.changeCurrentDepartment',
    { ...params, source: +getProjectInfo.source || 20 },
    { appkey },
  )
}

/**
 * 获取商务信息（联系商务）
 *
 * @returns 包含 marketingPhone 营销电话
 */
export const getMarketVirtualContact = (params?: CommonData) => {
  return http<MarketVirtualContactResponse>('web.uam.applyCustomer.getVirtualNum', params, { appkey })
}

/**
 * 申请绑定客户编码 入参校验（忘记密码场景）
 *
 * @param params.customer - 客户编码或公司简称
 * @param params.safeVerifyId - 安全验证ID（图形验证码）
 */
export const applyBindCustomerParamCheck = (params: { customer: string; safeVerifyId?: string }) => {
  return http<any>('web.uam.apply.applyBindCustomerParamCheck', params, {
    appkey,
    extraHeader: { 'x-risk-version': 'captcha' },
  })
}

/**
 * 申请绑定客户编码（忘记密码-申请绑码）
 *
 * @param params.customerName - 公司名称/客户编码
 * @param params.applyReason - 申请原因
 * @param params.userName - 用户姓名
 * @param params.cancelOtherApplyFlag - 是否取消其他申请
 * @param params.operatorSource - 来源渠道
 */
export const applyBindCustomer = (params: {
  customerName: string
  applyReason: string
  userName: string
  cancelOtherApplyFlag?: boolean
  operatorSource?: number | string
}) => {
  return http<any>(
    'web.uam.apply.applyBindCustomerFromClient',
    {
      ...params,
      operatorSource: params.operatorSource || getProjectInfo.source || '',
    },
    { appkey },
  )
}

/**
 * 获取推荐公司列表（申请绑定其他公司）
 *
 * @returns 推荐公司列表数组
 */
export const getFrontRecommendCustomer = () => {
  return http<FrontRecommendCustomerResponse>('web.uam.uamAppUserRelation.getFrontRecommendCustomer', undefined, { appkey })
}

/**
 * 校验是否可申请绑定其他公司（单个校验）
 *
 * 与 H5 保持一致：入参字段名为 `customer`（不是 customerCode）
 *
 * @param params.customer - 客户编码
 * @param params.safeVerifyId - 安全验证ID（图形验证码）
 */
export const applyBindOtherCustomerCheck = (params: {
  customer: string
  safeVerifyId?: string
}) => {
  return http<ApplyBindOtherCheckResponse>('web.uam.apply.applyBindOtherCustomerCheck', params, {
    extraHeader: { 'x-risk-version': 'captcha' },
    hideToast: true,
  })
}

/**
 * 提交绑定其他公司申请
 *
 * @param params.customerCodes - 客户编码数组
 * @param params.applyReason - 申请原因
 * @param params.operatorSource - 来源渠道
 */
export const bindOtherCustomerList = (params: {
  applyBindCustomerCodeList: string[]
  applyReason: string
  operatorSource?: number | string
}) => {
  return http<BindOtherCustomerListResponse>(
    'web.uam.uamAppUser.bindOtherCustomerList',
    {
      ...params,
      operatorSource: params.operatorSource || getProjectInfo.source || '',
    },
    { appkey },
  )
}

/**
 * 批量黑名单校验（提交前校验）
 *
 * @param params.customerCodeList - 客户编码数组
 * @returns 包含错误信息列表
 */
export const batchCheckBlackCustomerCode = (params: { customerCodeList: string[] }) => {
  return http<BatchCheckBlackResponse>(
    'web.uam.userCenter.userBlack.batchCheckBlackCustomerCode',
    params,
    { appkey, extraHeader: { 'x-risk-version': 'captcha' } },
  )
}

/**
 * 查询企业微信二维码
 *
 * @param employeeNumber - 员工号
 * @returns 包含 wechatQRCodeUrl 企业微信二维码URL
 */
export const queryWechatQRCode = (employeeNumber: string) => {
  return http<WechatQRCodeResponse>('web.uam.apply.queryWechatQRCode', { employeeNumber }, { appkey })
}

// 获取其他绑定公司申请明细页商务虚拟号
export const getOtherBindVirtualNum = (params: { outPhone: string; needVerifyAuthName: boolean }) => {
  return http<any>('web.uam.apply.getOtherBindVirtualNum', params, { appkey })
}

// 获取管理员联系方式
export const getApplyVirtualContact = (parmas: any) => {
  return http<any>('web.uam.apply.getVirtualNum', parmas, { hideToast: true })
}

/**
 * 申请绑定后-市场手机号-上报
 *
 * @param params.customerName - 公司简称
 */
export const applyResultCallPhoneReportApi = (params: { customerName: string }) => {
  return http<any>('web.uam.contactsSync.approveAssAccount', params, {
    appkey,
    hideToast: true,
  })
}
