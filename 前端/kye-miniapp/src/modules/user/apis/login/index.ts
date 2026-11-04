import { httpUser } from '@modules/user/apis/requestUser'
import { loginFromType } from '@modules/user/constants'
import { getDeviceType } from '@modules/user/utils/device'
import * as Types from '@modules/user/apis/login/types'
// import { getUserPhoneStorage } from '@public/storage/user'
import Taro from '@tarojs/taro'
import { getEnvConfig } from '@/public/config'
import { useLoginPublicParmas } from '../../pages/login/components/phone-login/hooks'
import { encryptPhone } from '../../utils/cryptoJs'

/** 第三方自动登录 */
export const fetchThirdAutoLogin = (param) => {
  return httpUser<Types.ThirdAuthorizedLoginData>(
    'web.login.thirdAutoLogin',
    {
      ...param,
      from: loginFromType,
      deviceType: getDeviceType(),
    },
    { unToken: true, hideToast: true },
  )
}

export const wechatAutoLogin = async (param) => {
  return httpUser<Types.ThirdAuthorizedLoginData>(
    'web.ssoWeChatMini.autoLogin',
    {
      ...param,
      from: (await getEnvConfig()).from,
      deviceType: getDeviceType(),
    },
    { unToken: true, hideToast: true },
  )
}

/* 支付宝一键授权登录 */
export const aliAuthorizedLogin = (param) => {
  // TODO 仅用于调试 - 待移除
  Taro.removeStorageSync('openAliAppLoginTest')
  const { deviceId } = useLoginPublicParmas()
  return httpUser<Types.ThirdAuthorizedLoginData>(
    'web.login.thirdAuthorizedLogin',
    { ...param, from: loginFromType, deviceType: getDeviceType(), deviceId },
    { unToken: true },
  )
}

/** 微信一键授权登录 */
export const wxAuthorizedLogin = (param) => {
  const { deviceId } = useLoginPublicParmas()

  return httpUser<Types.ThirdAuthorizedLoginData>(
    'web.ssoWeChatMini.login',
    { ...param, from: loginFromType, deviceType: getDeviceType(), deviceId },
    { unToken: true },
  )
}

/* 第三方注销登录 */
export const fetchLoginOff = (param) => {
  return httpUser('web.ssoUser.logOff', { ...param, from: loginFromType, deviceType: getDeviceType() })
}

/** 登出 */
export const fetchLoginOut = (param) => {
  // const phone = getUserPhoneStorage()
  return httpUser('web.login.logout', { from: loginFromType, deviceType: getDeviceType(), ...param })
}

/** 发送验证码 */
export const sendSmsCode = async (param: Types.SendSmsCodeReq) => {
  const phoneCipher = await encryptPhone(param.phone)
  console.log(phoneCipher, 'phoneCipher')
  return httpUser<Types.CaptchaRes>('web.login.verification.sendSmsCode', {
    ...param,
    phoneCipher,
  })
}

/** 验证码登录 */
export const smsLogin = (param: Types.SmsLoginReq) => {
  return httpUser<Types.ThirdAuthorizedLoginData & Types.CaptchaRes>('web.login.smsLogin', param)
}

/** app 验证码登录 */
export const appSmsLogin = (param: Types.SmsLoginReq) => {
  return httpUser<Types.ThirdAuthorizedLoginData & Types.CaptchaRes>('web.ssoApp.login', param)
}

/** 账密登录 */
export const pwdLogin = async (param: Types.PwdLoginReq) => {
  const phoneCipher = await encryptPhone(param.phone)
  return httpUser<Types.ThirdAuthorizedLoginData & Types.CaptchaRes>('web.login.passwordLogin', {
    ...param,
    phoneCipher,
  })
}

/* 调试-获取token */
export const debugGetAccessToken = (param) => {
  // TODO 仅用于调试
  param.clientTag = 'KY_DELIVERY_WECHAT_APPLET'
  Taro.setStorageSync('openAliAppLoginTest', '1')
  return httpUser<Types.ThirdAuthorizedLoginData & Types.CaptchaRes>('web.ssoToken.getAccessToken', param)
}

/* 微信APP一键登录 */
export const wxAppLoginAuthorizedLogin = (param: Types.AppAuthLoginReq) => {
  return httpUser<Types.ThirdAuthorizedLoginData>('web.login.weChat.authorizedLogin', param)
}

/* APP一键登录 */
export const appLoginAuthorizedLogin = (param: Types.AppAuthLoginReq) => {
  return httpUser<Types.ThirdAuthorizedLoginData>('web.login.localPhoneLogin', param)
}

export const wxAppAutoLogin = (param: Types.AppRefreshToken) => {
  return httpUser<Types.ThirdAuthorizedLoginData>('web.ssoApp.autoLogin', param, { hideToast: true })
}

export const getRegisterGuidePage = (param: Types.WebLoginGuidePageGetRegisterGuidePageIn) => {
  return httpUser<Types.WebLoginGuidePageGetRegisterGuidePageOut>('web.login.guidePage.getRegisterGuidePage', param)
}
