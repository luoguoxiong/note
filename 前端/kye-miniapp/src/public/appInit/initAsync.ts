import { nextTick } from 'vue'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { useVersionReport } from '@public/components/business/version-manage-popup/hooks/useVersionReport'
import { initGlobalSubscribeHandler } from '@public/appInit/initGlobalSubScribe'
const { autoLoginHook } = useAutoLogin()

const { reportAppVersionUseThrottle } = useVersionReport()

/* 版本上报 */
export const initVersionReport = () => {
  setTimeout(() => {
    // app/微信小程序 使用上报
    reportAppVersionUseThrottle()
  }, 2000)
}

/**
 * @Desc: initGlobalASync 全局异步调用数据
 */
export const initGlobalASync = async () => {
  try {
    await autoLoginHook()
  } finally {
    // 登录成功/失败后调用
    nextTick(() => {
      initVersionReport()
      initGlobalSubscribeHandler()
    })
  }
}
