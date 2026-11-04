import { isWxAppEnv } from '@public/utils'
import { initAppLaunch } from '@public/appInit/initLaunch/initAppLaunch'
import { initCommonLaunch } from '@public/appInit/initLaunch/initCommonLaunch'

/* 区分端-冷启动事件*/
const platformLaunch = async () => {
  // 识别app端特有-冷启动事件
  if (isWxAppEnv) {
    await initAppLaunch()
  }
}

/* 冷启动-全局触发 */
export const initGlobalLaunch = async () => {
  try {
    await platformLaunch()
    // 公共-冷启动事件
    initCommonLaunch()
  } catch (e) {
    console.error('log initGlobalLaunch error', e)
  }
}
