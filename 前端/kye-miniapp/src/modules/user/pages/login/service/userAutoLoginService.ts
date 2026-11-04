/**
 * @Desc: userAutoLoginService 自动登录 + 登录页跳转触发
 * @Date: 2024/11/15
 */
import { handleAutoLogin } from '@modules/user/pages/login/service/userService'
import { openLoginPage } from '@public/utils/request/useLogOutTip/openLogin'
import { Any } from '@public/utils/types'
import { useAutoLogin, globalCheckLoginResolve } from '@public/utils/user/useAutoLogin'

const { handleGlobalAutoLoginCall } = useAutoLogin()

/* 手动触发自动登录参数 */
interface UserLoginOptions {
  loginPage?: boolean // 是否跳转登录页
  force?: boolean // 强制自动登录
}

/**
 * 判断登录，触发自动登录跳转登录页 (适用非首页进入小程序,不每次都使用自动登录)
 * @param options
 */
export const handleUserLogin = async (options: UserLoginOptions = {}) => {
  const config = { loginPage: true, ...options }
  // return await handleUserAutoLogin(config)
  return handleGlobalAutoLoginCall().catch(() => {
    if (config?.loginPage) {
      openLoginPage()
    }
  })
}

/**
 * 调用自动登录, 失败-跳转登录页
 * @param options
 * @returns {Promise<unknown>}
 */
export const handleUserAutoLogin = (options: UserLoginOptions = {}) => {
  return new Promise((resolve, reject) => {
    handleAutoLogin(null)
      .then(() => {
        resolve(true)
      })
      .catch((e) => {
        if (options?.loginPage) {
          openLoginPage()
        }
        reject(e)
      })
  })
}

/* 调用次数限制 */
export const limitFunctionCalls = (fn, limit, interval, cancel?: any) => {
  let callCount = 0 // 调用计数
  let timer = null as Any // 定时器

  return function (...args) {
    if (callCount < limit) {
      fn(...args) // 调用函数
      callCount++ // 增加计数

      // 设置或重置定时器
      if (!timer) {
        timer = setTimeout(() => {
          callCount = 0 // 清空次数
          timer = null
        }, interval)
      }
    } else {
      console.log('频繁触发多次,短时间内暂停重复')
      if (cancel) {
        cancel()
      }
    }
  }
}

/* 自动登录 + 频繁调用次数管控 */
export const handleLoginControl = limitFunctionCalls((options = {}) => handleUserLogin(options), 2, 10 * 3600)
