/**
 * @Desc: cancel
 * @Author: wu xingtao
 * @Date: 2024/4/15
 */

/**
 * 忽略请求手动取消
 * @type {string[]}
 */
export const cancelWhiteList = [
  'web.order.verification.config',
  'web.ssoUser.getUserInfoByPhoneNew',
  'web.ssoWeChatTool.getJsSdkSign',
  'web.ssoUser.getBuriedPointUserInfo',
]
