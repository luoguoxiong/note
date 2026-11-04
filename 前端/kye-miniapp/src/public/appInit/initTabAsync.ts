/**
 * @Desc: initTabAsync 切换tab async异步调用
 * @Date: 2025/12/3
 */
import { nextTick } from 'vue'
import { checkLoginSingleRefreshThrottle } from '@public/hooks/useCheckAutoLogin'
import { useVersionReport } from '@public/components/business/version-manage-popup/hooks/useVersionReport'
import { useAutoLogin } from '@public/utils/user/useAutoLogin'
import { getAppLaunchStatus } from '@public/appInit/initLaunch/initCommonLaunch'
import { useThemeStore } from '@/store'
const { autoLoginHook } = useAutoLogin()

const { reportAppVersionUseThrottle } = useVersionReport()

/* 节流事件列表 */
const throttleEventLists = () => {
  // 已完成冷启动-本次才执行
  if (getAppLaunchStatus()) {
    // 用户信息续期-更新(1min)
    checkLoginSingleRefreshThrottle()
    // 应用版本使用-信息上报(10min)
    reportAppVersionUseThrottle()
  }
  useThemeStore()?.setTabbar()
}

/* 切换tab async异步调用/节流事件事件 */
export const handleTabShowAsync = async () => {
  try {
    await autoLoginHook()
  } finally {
    // 登录成功/失败后调用
    nextTick(() => {
      throttleEventLists()
    })
  }
}
