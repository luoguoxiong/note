/**
 * @Desc: useAutoLogin 全局自动登录模块
 * @Author: wu xingtao
 * @Date: 2024/11/26
 */
import { ref } from 'vue'
import { handleAutoLogin } from '@modules/user/pages/login/service'
import { openLoginPage } from '@order-public-sub-public/utils/request/useLogOutTip/openLogin'
import { getUserInfoStorage } from '@order-public-sub-public/storage'
import { PlainObject } from '@order-public-sub-public/utils/types'

/* 第一次自动登录统一回调类型 */
interface AutoLoginHook {
  needLogin?: boolean // 是否需要自动登录
}

/* 登录是否执行初始化 */
export const loginReadyStatus = ref(false)
/* 全局自动登录Promise */
const globalAutoLoginPromise = ref<Promise<PlainObject> | null>(null)

export const useAutoLogin = () => {
  /* 全局触发自动登录 */
  const handleGlobalAutoLogin = () => {
    globalAutoLoginPromise.value = new Promise((resolve, reject) => {
      handleAutoLogin(null)
        .then((data: PlainObject) => {
          loginReadyStatus.value = true
          resolve(data)
        })
        .catch((e) => {
          reject(e)
        })
    })
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
  const autoLoginHook = (options: AutoLoginHook = { needLogin: false }) => {
    return new Promise((resolve, reject) => {
      try {
        if (globalAutoLoginPromise.value) {
          resolve(globalAutoLoginPromise.value)
          globalAutoLoginPromise.value.catch(() => {
            // 是否需要手动登录-自动登录失败-跳转登录页
            if (options?.needLogin) {
              openLoginPage()
            }
          })
        } else {
          resolve(getUserInfoStorage())
        }
      } catch (e) {
        console.log('未执行初始化自动登录')
        reject(e)
      }
    })
  }

  return {
    loginReadyStatus,
    handleGlobalAutoLogin,
    setLoginReadyStatus,
    autoLoginHook,
    clearGlobalAutoLoginPromise,
  }
}
