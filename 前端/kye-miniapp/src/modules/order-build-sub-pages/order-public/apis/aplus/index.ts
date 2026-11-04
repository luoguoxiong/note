import { http } from '@order-public-sub-public/utils/request'
import { getToken } from '@order-public-sub-public/storage/user'
import { getAuthCodeValue } from '@order-public-sub-public/utils'
import { loginFromType } from '@order-public-sub-public/constants'

/* 根据小程序code查询openid*/
export const fetchAppletOpenIdByCode = async () => {
  const authCode = await getAuthCodeValue()
  const params = {
    authCode,
    from: loginFromType,
  }

  return http<AppletOpenIdByCodeResponse>(
    'web.login.loginComponent.getAppletOpenIdByCode',
    { ...params },
    { unToken: true, hideToast: true },
  )
}

/* 获取埋点用户基本信息(新) */
export const getBuriedPointUserInfo = (param = {}) => {
  const accessToken = getToken()
  return http<BuriedPointUserInfo>(
    'web.ssoUser.getBuriedPointUserInfo',
    { accessToken, from: loginFromType, ...param },
    { hideToast: true },
  )
}
