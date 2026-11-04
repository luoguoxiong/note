/**
 * @Desc: useAutoLogin 全局自动登录模块
 * @Author: wu xingtao
 * @Date: 2024/11/26
 */
import { ref } from 'vue'
import { loggedLoginSuccess, handleAutoLogin } from '@modules/user/pages/login/service'
import { openLoginPage } from '@public/utils/request/useLogOutTip/openLogin'
import { getToken, getUserInfoStorage } from '@public/storage'
import { PlainObject } from '@public/utils/types'
import { checkLoginSingleRun } from '@public/hooks/useCheckAutoLogin'
import { HttpCode } from '@public/utils/request/constants'
import { useLogOutTip } from '@public/utils/request/useLogOutTip'
import { useThrottleAsync } from '@public/hooks/useThrottleAsync'
import { RefreshTokenUserInfoResponse } from '@public/apis/user/types'
import { isWxAppEnv } from '@public/utils'

/* 第一次自动登录统一回调类型 */
interface AutoLoginHook {
  needLogin?: boolean // 是否需要自动登录
  needAppPending?: boolean // app是否等待
  hideCatch?: boolean // 忽略自动登录失败catch
}

/* 登录是否执行初始化 */
export const loginReadyStatus = ref(false)
/* 全局自动登录Promise */
const globalAutoLoginPromise = ref<Promise<PlainObject> | null>(null)
const globalCheckLoginPromise = ref<Promise<PlainObject> | null>(null)
export const globalCheckLoginResolve = ref<((value?: any) => void) | null>(null)
export const globalCheckLoginReject = ref<((value?: any) => void) | null>(null)

export const useAutoLogin = () => {
  /* 全局触发自动登录 */
  const handleGlobalAutoLoginCall = () => {
    globalAutoLoginPromise.value = new Promise(async (resolve, reject) => {
      handleAutoLogin(null)
        .then((data: PlainObject) => {
          loginReadyStatus.value = true
          resolve(data)
          // 清空promise
          clearGlobalAutoLoginPromise()
        })
        .catch((e) => {
          reject(e)
          // 清空promise
          clearGlobalAutoLoginPromise()
        })
    })

    return globalAutoLoginPromise.value
  }
  /* 1s后检测用户有效期状态清理 */
  const autoCancelGlobalCheckLogin = () => {
    setTimeout(() => {
      if (globalCheckLoginResolve.value) {
        globalCheckLoginResolve.value()
      }
    }, 4000)
  }

  /**
   * 全局-检测用户有效期链路-单例
   * @returns {Promise<any>}
   * 场景1：返回token失效》触发查询logoutTip 查询失效原因》code:IC_005则自动登录
   * 场景2：token未失效,若返回用户信息，直接更新本地
   * 场景3：无token》唤起全局自动登录单例
   */
  const handleGlobalCheckLoginFunc = async () => {
    globalCheckLoginPromise.value = new Promise(async (resolve, reject) => {
      globalCheckLoginResolve.value = resolve
      globalCheckLoginReject.value = reject
      try {
        const token = getToken()
        if (!token) {
          console.log('[log] handleGlobalLoginCheck, 无token自动登录')
          // app不会调用自动登录-会直接抛出catch
          handleGlobalAutoLoginCall()
          // resolve
          globalCheckLoginResolve.value()
        } else {
          // 开启定时2s到期自动resolve
          autoCancelGlobalCheckLogin()
          // checkLogin 接口res会返回code!==0 情况
          const res = await checkLoginSingleRun()
          console.log('[log] checkLoginSingleRun result', res)
          // token失效场景
          if (res?.code === HttpCode.EXPIRED) {
            const { onLogoutTipApi } = useLogOutTip()
            console.log('[log] checkLoginSingleRun 开始logouttip')
            onLogoutTipApi({ from: 'checkLogin' })
              .then((resTip) => {
                console.log('[log] 唯一 Promise resolved', resTip)
                // IC_0005 场景-跳转自动登录场景
                if (resTip?.code === HttpCode.SUCCESS && resTip?.data && resTip.data?.type === 'IC_0005') {
                  // // 全局globalCheck实例-resolve,会进入自动登录promise
                  // globalCheckLoginResolve.value?.()
                  globalAutoLoginPromise.value
                    .then(() => {
                      globalCheckLoginResolve.value()
                    })
                    .catch(() => {
                      globalCheckLoginReject.value?.()
                    })
                } else {
                  globalCheckLoginReject.value?.()
                }
              })
              .catch((err) => {
                console.log('[log] 唯一 Promise rejected', err)
                globalCheckLoginReject.value?.()
              })
          } else {
            // 检测登录未失效-更新本地用户信息
            if (res?.code === HttpCode.SUCCESS && res.data) {
              loggedLoginSuccess(res.data as RefreshTokenUserInfoResponse)
            }
            // 非token失效场景
            globalCheckLoginResolve.value()
          }
        }
      } catch (e) {
        globalCheckLoginReject.value?.()
      } finally {
        globalCheckLoginPromise.value = null
      }
    })
    return globalCheckLoginPromise
  }

  /* 更新登录状态 */
  const setLoginReadyStatus = (value: boolean) => {
    loginReadyStatus.value = value
  }
  /* 清空全局promise-登录成功后执行 */
  const clearGlobalAutoLoginPromise = () => {
    globalAutoLoginPromise.value = null
  }

  /* 全局自动登录hook 用于订阅初始化登录后数据更新 */
  const autoLoginHook = (options: AutoLoginHook = { needLogin: false, hideCatch: false, needAppPending: true }) => {
    return new Promise(async (resolve, reject) => {
      try {
        // const { isApp } = getEnvConfig()
        // if (isApp && !options?.needAppPending) {
        //   return resolve({})
        // }
        const token = getToken()
        if (token) {
          // 存在全局checkLogin promise
          if (globalCheckLoginPromise.value) {
            console.log('[log] autoLoginHook globalCheckLoginPromise start')
            try {
              await globalCheckLoginPromise.value
              resolve(getUserInfoStorage())
            } catch (e) {
              reject()
            }
            console.log('[log] autoLoginHook globalCheckLoginPromise resolve')
          } else {
            resolve(getUserInfoStorage())
          }
        } else {
          // 存在正在调用自动登录链路
          if (globalAutoLoginPromise.value) {
            await globalAutoLoginPromise.value.then(resolve)
          } else {
            if (options?.needLogin) {
              openLoginPage()
            }
          }
          resolve(getUserInfoStorage())
        }
      } catch (e) {
        console.log('log 未执行初始化自动登录', !getToken(), options?.needLogin, e)
        reject(e)
        if (!getToken() && options?.needLogin) {
          openLoginPage()
        }
      }
    })
  }
  /* 全局-检测用户有效期链路(节流) */
  const { run } = useThrottleAsync(handleGlobalCheckLoginFunc, 60 * 1000)

  return {
    loginReadyStatus,
    handleGlobalCheckLoginThrottle: run,
    handleGlobalAutoLoginCall,
    setLoginReadyStatus,
    autoLoginHook,
    clearGlobalAutoLoginPromise,
  }
}
