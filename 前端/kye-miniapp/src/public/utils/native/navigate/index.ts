/* 跨越页面跳转封装
 * 支持功能
 * 1、页面轻应用跳转
 * 2、单次跳转轻应用 + 拉取单个轻应用异步更新
 * 3、TODO: 支持进入登录页前检测到需要登录页》登录后，执行原登录跳转逻辑，登录后直接跳转到落地页
 *  */

import Taro from '@tarojs/taro'
import { PlainObject } from '@public/utils/types'
import { getToken } from '@public/storage'
import { openLoginPage } from '@public/utils/request/useLogOutTip/openLogin'

interface NavigatorProps {
  type: 'navigateTo' | 'redirectTo' | 'switchTab'
  option?: { url?: string; needLogin?: boolean } & PlainObject
}

// 登录成功直接跳转，登录成功后再返回navigateBack后再执行
type LoginBackType = 'navigate' | 'navigateBack' | ''

class KyeNative {
  public loginBackFn: (() => void) | null = null // 是否存在登录后回调
  public loginBackType: LoginBackType = '' // 是否存在登录后navigate类型
  /**
   * 跳转页面前-代理逻辑
   * 支持路由拦截跳转;
   * 支持自定义逻辑
   */
  navigateBefore(
    type: NavigatorProps['type'],
    option: NavigatorProps['option'] = {},
    loginQuery: Record<string, unknown> = {},
  ) {
    const needLoginCheck = (option?.url && option?.url.includes('needLogin=true')) || option?.needLogin
    const token = getToken()
    if (needLoginCheck && !token) {
      openLoginPage(loginQuery)
      const callback = () => {
        // 触发跳转，需销毁登录页面栈
        if (type === 'navigateTo') {
          type = 'redirectTo'
        }
        return this.nativeNavigate(type, option)
      }
      this.updateLoginBackFn(callback, 'navigate')
    } else {
      // 无需判断登录
      return this.nativeNavigate(type, option)
    }
  }
  /**
   * 原生方法
   * @param type
   * @param option
   * @returns {Promise<TaroGeneral.CallbackResult>}
   */
  private nativeNavigate(type: NavigatorProps['type'], option) {
    return Taro[type || 'navigateTo'](option)
  }

  /**
   * navigateTo 外部调用
   * @param option
   * @param loginQuery
   */
  navigateTo(option = {}, loginQuery: Record<string, unknown> = {}) {
    return this.navigateBefore('navigateTo', option, loginQuery)
  }
  /**
   * redirectTo 外部调用
   * @param option
   */
  redirectTo(option = {}) {
    return this.navigateBefore('redirectTo', option)
  }

  switchTab(option = {}) {
    return this.navigateBefore('switchTab', option)
  }
  updateLoginBackFn(callback: () => void, type: LoginBackType) {
    this.loginBackFn = callback
    this.loginBackType = type
  }
  /* 登录成功返回回调 */
  loginBackCallback() {
    if (this.loginBackFn) {
      this.loginBackFn()
      this.clearLoginBackFn()
    }
  }
  /**
   * 销毁临时跳转回调
   * 离开登录页-销毁临时回调(顶部返回按钮
   * 成功执行登录跳转 - 销毁临时回调
   */
  clearLoginBackFn() {
    // 销毁跳转回调
    if (this.loginBackFn) {
      setTimeout(() => {
        this.loginBackFn = null
        this.loginBackType = ''
      }, 100)
    }
  }

  checkLogin(callback: () => void) {
    openLoginPage()
    kyeNavigate.updateLoginBackFn(callback, 'navigate')
  }
  /**
   * 执行回调函数
   * 1、已登录-直接执行
   * 2、未登录-跳转登录后再跳回执行
   * @param callback
   * @param navigateType
   */
  ensureLogin(callback: () => void, navigateType: LoginBackType = 'navigateBack') {
    const token = getToken()
    // 存在token直接执行
    if (token) {
      callback()
    } else {
      // 无token：登录成功先返回来源页，再执行回调（回调本身不含跳转）
      openLoginPage()
      this.updateLoginBackFn(callback, navigateType)
    }
  }
}

const kyeNavigate = new KyeNative()
export default kyeNavigate
