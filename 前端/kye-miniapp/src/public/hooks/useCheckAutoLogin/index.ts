/**
 * @Desc: index
 * @Date: 2025/11/28
 */
import { ref } from 'vue'
import { getToken } from '@public/storage/user'
import { fetchUserInfoAndRefreshToken } from '@public/apis/user'
import { useThrottleAsync } from '@public/hooks/useThrottleAsync'
import { HttpCode } from '@public/utils/request/constants'
import { loggedUpdateUserInfo } from '@modules/user/pages/login/service'
import { RefreshTokenUserInfoResponse } from '@public/apis/user/types'
import { HttpResponse } from '@public/utils/types'
// import { updateRelaNameSwitch } from '../useRedirectH5ToNative'

/* 手动单次检测用户登录状态 */
const checkLoginSingle = async () => {
  const token = getToken()
  if (!token) {
    return Promise.resolve({
      code: HttpCode.EMPTY,
      msg: 'token为空',
      data: null,
    })
  } else {
    // updateRelaNameSwitch()
    // const appRelaunched = getAppLaunched()
    return fetchUserInfoAndRefreshToken()
  }
}
// 1分钟仅触发1次
const { run, forceRun } = useThrottleAsync(checkLoginSingle, 60 * 1000)

/* 节流-触发登录状态check */
export const checkLoginSingleRun = run
/* 强制-触发登录状态check */
export const checkLoginSingleForce = forceRun

/**
 * 节流-触发登录状态check-更新本地用户信息
 * 已登录状态触发节点：切换tab
 * 登录后:触发tab-不要触发该接口
 * @returns {Promise<void>}
 */
export const checkLoginSingleRefreshThrottle = async () => {
  try {
    // 锁定状态不调用接口
    if (getCheckLoginLock()) {
      return
    }
    const res = (await checkLoginSingleRun()) as HttpResponse<RefreshTokenUserInfoResponse> & { isLastValue?: boolean }
    // 检测登录未失效-更新本地用户信息
    if (res?.code === HttpCode.SUCCESS && res.data) {
      // 非节流数据-更新
      if (!res?.isLastValue) {
        loggedUpdateUserInfo(res.data as RefreshTokenUserInfoResponse)
      }
    }
  } catch (e) {
    console.error('[log] checkLoginRefresh error', e)
  }
}

/* 禁止调用checkLoginSingleRefreshThrottle 场景用锁维护 */
const checkLoginSingleRefreshLock = ref(false)

/**
 * 更新续期用户接口锁定逻辑
 * @param val
 * @ 场景1： 自动登录/授权/账密/短信登录后无需调用
 */
export const updateCheckLoginLock = (val: boolean) => {
  checkLoginSingleRefreshLock.value = val
}
/* 获取续期用户接口锁定状态 */
export const getCheckLoginLock = () => {
  return checkLoginSingleRefreshLock.value
}
/* 续期接口-打开锁定-定期自动移除锁 */
let checkLoginLockTimeout = null
export const switchCheckLoginLockAuto = () => {
  updateCheckLoginLock(true)
  if (checkLoginLockTimeout) {
    clearTimeout(checkLoginLockTimeout)
  }
  checkLoginLockTimeout = setTimeout(() => {
    updateCheckLoginLock(false)
  }, 60 * 1000)
}
