import Taro from '@tarojs/taro'

/* 判断是否已经打开登录页 */
export const hasOpenedLoginPage = () => {
  let pages = Taro.getCurrentPages()
  let hasLoginPage = false // 是否存在登录页
  for (let i = 0; i <= pages.length; i++) {
    // 支付宝处理 TODO 后续兼容微信
    if (pages[i] && pages[i]?.$taroPath.includes('modules/user/pages/login/index')) {
      hasLoginPage = true
      break
    }
  }
  return hasLoginPage
}

/* 打开登录页 */
export const openLoginPage = () => {
  const hasLoginPage = hasOpenedLoginPage()
  if (!hasLoginPage) {
    Taro.navigateTo({
      url: '/modules/user/pages/login/index',
    })
  }
}
