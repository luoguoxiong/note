/**
 * @Desc: initAppLaunch 应用冷启动触发事件
 * @Date: 2025/12/11
 */

import { nextTick } from 'vue'
import { getAppUserTokenRefresh } from '@public/apis/user'
import { isWxAppEnv } from '@public/utils'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { getToken, getUserInfoStorage } from '@/public/storage'
import { splashManager } from '@/public/components/business/advertise-center'

const initAppUserTokenRefresh = () => {
  if (getToken()) {
    const userInfo = getUserInfoStorage()
    const refreshToken = userInfo?.ecasToken?.refreshToken
    // app接口续期
    getAppUserTokenRefresh({
      refreshToken,
    })
  }
}

/* app 应用冷启动初始化 */
export const initAppLaunch = async () => {
  const { autoLoginHook } = useAutoLogin()
  try {
    // 如果app-展示广告，则延迟开启全局信息调用
    await splashManager.onHide()
    // 配置等待getUser接口
    await autoLoginHook({ needAppPending: true })
    // getUserByToken成功才执行
    nextTick(() => {
      initAppUserTokenRefresh()
    })
  } catch (e) {
    console.error('[log] 冷启动报错', e)
  }
}

export const initGlobalLaunch = async () => {
  // 识别app端冷启动事件
  if (isWxAppEnv) {
    await initAppLaunch()
  }
}
