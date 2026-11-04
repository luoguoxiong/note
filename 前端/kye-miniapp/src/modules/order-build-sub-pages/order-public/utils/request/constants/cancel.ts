/**
 * 忽略请求手动取消
 * @type {string[]}
 */
export const cancelWhiteList = [
  'web.ssoUser.getUserInfoByPhoneNew',
  'web.ssoWeChatTool.getJsSdkSign',
  'web.ssoUser.getBuriedPointUserInfo',
]

export const logoutIgnoreList = [
  'web.login.logOut'
]