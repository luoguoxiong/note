import { http } from '@public/utils/request'
import { loginFromType } from '@public/constants'
import {
  LoginUserAccountInfo,
  WebSsoUserModifyUserInfoIn,
  WebUserHeadUploadImgIn,
  WebUserHeadUploadImgOut,
  WebV2UserRealNameCheckAuthIn,
  WebV2UserRealNameCheckAuthOut,
} from '@modules/user/apis/user/types'
import { getEnvConfig } from '@/public/config'

/* 获取用户信息详情 */
export const fetchUserInfoByPhone = (param) => {
  return http('web.ssoUser.getUserInfoByPhoneNew', { ...param, from: loginFromType }, { hideToast: true })
}

/* 获取用户是否设置密码 */
export const fetchUserAccountInfo = () => {
  return http<LoginUserAccountInfo>('web.login.user.userAccountInfo', {}, { hideToast: true })
}

/* 修改用户信息 */
export const modifyUserInfo = async (param: WebSsoUserModifyUserInfoIn) => {
  const env = getEnvConfig()
  return http<string>('web.ssoUser.modifyUserInfo', { ...param, from: env.from, form: env.form })
}

/* 用户头像上传 */
export const fetchHeadIconUpload = (params: WebUserHeadUploadImgIn) => {
  return http<string>('web.app.headIconUpload', params, { hideToast: false })
}

export const uploadUserAvatar = (params: WebUserHeadUploadImgIn) => {
  return http<WebUserHeadUploadImgOut>('web.user.head.uploadImg', params)
}

export const getRealName = (param: WebV2UserRealNameCheckAuthIn) => {
  return http<WebV2UserRealNameCheckAuthOut>('web.v2.userRealName.checkAuth', param, { hideToast: true })
}

/* 获取用户邀请海报 */
export const getUserInvitePoster = (param) => {
  return http('web.uam.sendRealNameStatus.qrCodeImg', param, { hideToast: true })
}
