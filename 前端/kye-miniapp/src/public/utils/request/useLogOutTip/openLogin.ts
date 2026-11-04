import Taro from '@tarojs/taro'
import { urlContact } from '../../url'
import { getToken } from '@public/storage'

/* 登录页打开监听器集合（模块级单例，纯增量、向后兼容） */
const loginPageOpenListeners = new Set<() => void>()

/**
 * 订阅登录页打开事件
 * 用于弹窗等组件感知登录流程：在登录页打开时打标，返回后自行关闭
 * @returns 取消订阅函数
 */
export const onLoginPageOpen = (cb: () => void) => {
  loginPageOpenListeners.add(cb)
  return () => {
    loginPageOpenListeners.delete(cb)
  }
}

/* 通知所有监听器：登录页已打开 */
const notifyLoginPageOpen = () => {
  loginPageOpenListeners.forEach((cb) => {
    try {
      cb()
    } catch (e) {
      console.error('[openLoginPage] listener error:', e)
    }
  })
}

/* 判断是否已经打开登录页 */
export const isOpenedLoginPage = () => {
  let pages = Taro.getCurrentPages()
  let hasLoginPage = false // 是否存在登录页
  for (let i = pages.length - 1; i >= 0; i--) {
    const path: string = pages[i]?.route || pages[i]?.$taroPath
    if (path?.includes('modules/user/pages/login/index')) {
      hasLoginPage = true
      break
    }
  }
  return hasLoginPage
}

/* 打开登录页 */
export const openLoginPage = (query: Record<string, any> = {}) => {
  const hasLoginPage = isOpenedLoginPage()
  if (!hasLoginPage) {
    Taro.navigateTo({
      url: urlContact('/modules/user/pages/login/index', query),
    })
    // 通知订阅者：登录页已打开（用于弹窗等组件感知登录流程并自行关闭）
    notifyLoginPageOpen()
  }
}

/* 未登陆-触发登陆跳转 */
export const handleUnLoginHandler = (isForceJump?: boolean) => {
  const token = getToken()
  if (!token || isForceJump) {
    openLoginPage()
  }
}
