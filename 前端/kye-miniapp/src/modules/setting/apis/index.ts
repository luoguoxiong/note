/**
 * @Desc: index
 * @Date: 2025/7/18
 */
import { http } from '@public/utils/request'
import { ThirdLoginDataResponse } from '@modules/user/apis/login/types'
import {
  WebUserLoginOneKeyLogoutOtherDeviceIn,
  WebUserLoginOneKeyLogoutOtherDeviceOut,
} from './type'

/* sso-切换登录 */
export const ssoChangeAccountLoginApi = (param) => {
  return http<ThirdLoginDataResponse>('web.ssoChangeAccount.login', { ...param }, { hideToast: true })
}

/* sso-切回登录 */
export const ssoChangeAccountBackApi = (param) => {
  return http<ThirdLoginDataResponse>('web.ssoChangeAccount.changeBack', { ...param }, { hideToast: false })
}

/* 一键退登其他设备 */
export const oneKeyLogoutOtherDeviceApi = (param: WebUserLoginOneKeyLogoutOtherDeviceIn) => {
  return http<WebUserLoginOneKeyLogoutOtherDeviceOut>(
    'web.user.login.oneKeyLogoutOtherDevice',
    { ...param },
    { hideToast: true }
  )
}
