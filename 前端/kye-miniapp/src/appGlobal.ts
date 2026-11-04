import apm_help from '@public/utils/apm'
import { initGlobalASync } from '@public/appInit/initAsync'
import { platform } from '@public/utils/platformApi'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { useGeneralDataHook } from '@public/storage/hooks/useGeneralDataHook'
import { appPluginPushInit, getPushRoutePathByChannel } from '@public/utils/appPush'
import { isH5Env, isWxAppEnv } from '@public/utils'
import { usePhoneMask } from './public/hooks/usePhoneMask'
import aplus from './public/utils/aplusConfig'
import { h5Init } from './public/h5/init'
const { handleGlobalCheckLoginThrottle } = useAutoLogin()
const { setPhoneMask } = usePhoneMask()
let isFirstGetPhoneMask = true

/* apm + qt初始化*/
export const initQuickAplus = () => {
  // apm初始化
  apm_help.init()
  aplus.init()
}

/* 平台初始化逻辑 */
export const initPlatform = () => {
  /* 隐藏顶部添加桌面功能 */
  platform.hideAllAddToDesktopMenu()
}

/* 用户初始化 */
export const initUser = async () => {
  const { initDataFromLoginDataStorage } = useGeneralDataHook()
  try {
    await handleGlobalCheckLoginThrottle()
  } catch (e) {
    console.error('initUser error', e)
  }
  // 用户缓存写入通用数据
  initDataFromLoginDataStorage()
}

// 获取运营商初始化
export const initMaskPhone = () => {
  if (isWxAppEnv) {
    setPhoneMask(isFirstGetPhoneMask)
    isFirstGetPhoneMask = false
  }
}

/* 业务逻辑初始化 */
export const initService = () => {
  /* 心跳轮询 */
  // startPingPong()
}

/* app端插件-初始化 */
export const initAppPlugin = () => {
  if (isWxAppEnv) {
    // 消息路由-获取
    getPushRoutePathByChannel()
    // 极光消息-初始化
    appPluginPushInit()
  }
}

/* app实例初始化全局初始化调用 */
export const appGlobalInit = () => {
  return new Promise(async (resolve, reject) => {
    try {
      initQuickAplus()
      initPlatform()
      initAppPlugin()
      if (isH5Env) {
        h5Init()
      }
      await initGlobalASync()
      resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}
