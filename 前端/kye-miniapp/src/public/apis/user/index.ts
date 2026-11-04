import { http } from '@public/utils/request'
import {
  CustomerInfoResponseData,
  LogoutTipDataResponse,
  SettingPageUserAndAuthResponseData,
  WebLoginQrCodeGetQrCodeStatusIn,
  WebLoginQrCodeGetQrCodeStatusOut,
  WebLoginQrCodeOperationQrCodeIn,
  WebLoginQrCodeOperationQrCodeOut,
  RefreshTokenUserInfoResponse,
} from '@public/apis/user/types'
import { HttpOptions } from '@/public/utils/types'
import { getEnvConfig } from '@/public/config'
import { getLoginFromType } from '@/public/constants'

/* 查询退登原因 */
export const fetchLogoutTip = (param) => {
  return http<LogoutTipDataResponse>(
    'web.login.logoutTip',
    { ...param, from: getLoginFromType() },
    { unToken: true, hideToast: true },
  )
}

/* 获取用户信息详情 */
export const ApiUserInfoByPhone = async (param) => {
  return http('web.ssoUser.getUserInfoByPhoneNew', { ...param, from: (await getEnvConfig()).from }, { hideToast: true })
}

/* 获取用户信息详情V1-整合接口 */
export const ApiUserInfoByPhoneV1 = (param) => {
  return http('web.uam.userAuth.client.getPageHomeUser', { ...param, from: getLoginFromType() }, { hideToast: true })
}

export const getQRCodeStatus = (params: WebLoginQrCodeGetQrCodeStatusIn, options: Partial<HttpOptions> = {}) => {
  return http<WebLoginQrCodeGetQrCodeStatusOut>(
    'web.login.qrCode.getQrCodeStatus',
    { ...params, from: getLoginFromType() },
    options,
  )
}

export const operationQrCode = (params: WebLoginQrCodeOperationQrCodeIn, options: Partial<HttpOptions> = {}) => {
  return http<WebLoginQrCodeOperationQrCodeOut>(
    'web.login.qrCode.operationQrCode',
    { ...params, from: getLoginFromType() },
    options,
  )
}

// 用户绑码信息
export const ApiGetCustomerInfo = (params = {}) => {
  return http<CustomerInfoResponseData>('web.wechat.user.getcustomerInfo', params, { hideToast: true })
}
// 用户绑码信息 部门id
export const ApiGetDepartmentId = (params = {}) => {
  return http<CustomerInfoResponseData>('web.user.center.appUser.getCurrentUser', params, { hideToast: true })
}

export const isEmployee = (params: { phone: string }) => {
  return http<{ isEmployee: boolean }>('web.customer.isEmployee', params, { hideToast: true })
}

export const getIsRealName = () => {
  return http<any>('web.v2.userRealName.checkAuth', {}, { hideToast: true })
}

export const getUserBaseInfo = () => {
  return http<{
    registrationDay: number
    registrationTime: string
    headUrl: string
    position: string
    birthday: string
    /** 0-未设置，1-女，2-男 */
    sex: 0 | 1 | 2
  }>('web.uam.center.settingPage.getUserAndAuth', {}, { hideToast: true })
}

/* 新小程序设置页获取用户信息与实名认证信息 */
export const getSettingPageUserAndAuth = () => {
  return http<SettingPageUserAndAuthResponseData>('web.uam.center.settingPage.getUserAndAuth', {}, { hideToast: true })
}

/* web.login.userToken.refresh(app) */
export const getAppUserTokenRefresh = (params: { refreshToken?: string } = {}) => {
  return http('web.login.userToken.refresh', params, { hideToast: true })
}

export const refreshTokenApi = 'web.user.center.getUserByToken'

/* 检测登录状态 + 获取用户信息 */
export const fetchUserInfoAndRefreshToken = () => {
  return http<RefreshTokenUserInfoResponse>(
    refreshTokenApi,
    {},
    {
      hideToast: true,
      fullData: true,
    },
  )
}

/**
 * 获取配置(开关等,这里用在实名认证开关)
 * @param params
 * @returns
 *  出参：data.relaNameSwitch=true
 *              true = 走原生页
 *              false = 走H5
 */
export const getConfigBySource = (params: { source?: number } = {}) => {
  return http('web.uam.userCenter.staticConfig.getConfigBySource', params, { hideToast: true })
}
