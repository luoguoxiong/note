import md5 from 'js-md5'
import { Any } from '@/types'
import { http } from '@/utils/request/request'
import {
  UserInfo,
  UserInfoByPhone,
  userProfileInfo,
  CustomerBindInfo,
  RealNameAuthInfo,
  AppUserRelationAuth,
  CustomerInfo,
  PsdChangedInfo,
} from './types'

export const getInfo = (from = 6) => {
  return http<UserInfo>('web.ssoUser.getUserInfoByPhoneNew', { from })
}

/** 根据手机号查询用户绑码关系（未绑码拦截弹窗场景数据源，对齐老项目 getAppUserRelationAuth） */
export const getAppUserRelationAuth = () => {
  return http<AppUserRelationAuth>('web.uam.uamAppUserRelation.getBindInfo', {})
}

/** 客户编码签名（对齐老项目 UserService.createCustomerSign） */
export const createCustomerSign = (customerCode: string, phone: string) => {
  return md5(customerCode + phone).toUpperCase()
}

/** 查询客户信息（含下单报废/拉黑标识 allowToOrderFlag/Tip，报废拦截弹窗数据源） */
export const queryCustomerInfo = (customerCode: string, phone: string) => {
  const sign = createCustomerSign(customerCode, phone)
  return http<CustomerInfo>('web.user.getCustomerInfoWithSign', { sign, customerCode })
}

export const getUserProfileInfo = (params: Record<string, Any>) => {
  return http<userProfileInfo>('web.ssoUser.getBuriedPointUserInfo', params)
}

export const getUserInfoByPhone = () => {
  return http<UserInfoByPhone>('web.login.user.getUserInfoByPhone')
}

export const getCustomerCodeBindInfo = () => {
  return http<CustomerBindInfo>('web.uam.uamAppUser.getUserUnionBindInfo', {})
}

export const checkRealNameAuth = () => {
  return http<RealNameAuthInfo>('web.v2.userRealName.checkAuth', {})
}

/**
 * 检查 token 失效是否因为修改了密码（对齐老项目 UserService.checkPsdChanged）
 * token 放在报文体中、不带 token 头（unToken），失败静默由调用方走登录失效兜底
 * @param params.token  当前失效的 token
 * @param params.method 触发退登检查的失败接口名（公共 request 拦截器透传，便于后端定位，非必填）
 * @param params.from 来源（跟登陆一致）2：ios，4：安卓，6：小程序，7:PC客户端
 */
export const checkPsdChanged = (params: { token: string; from: number; method?: string }) => {
  return http<PsdChangedInfo>('web.login.logoutTip', params, { unToken: true, toast: false })
}
