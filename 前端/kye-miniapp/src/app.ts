import Taro from '@tarojs/taro'
import '@/public/appInit/initFirst'
import '@public/utils/aplusConfig'
import { createApp } from 'vue'
import { appGlobalInit, initUser, initMaskPhone } from '@/appGlobal'
import KyeMiniUi from '@kye-netc/kye-miniui'
import { setEnvConfig } from './public/config'
import { getSystemInfo } from './public/utils/getSystemInfo'
import { checkVersion } from './public/utils/checkversion'
import { pinia } from './store'
import { install } from '@/public/components/base'
import { H5RedirectToHome, useRedirect } from '@public/router'
import { getDefaultApplication } from '@/public/utils/application/applicationDefault'
import { initGlobalLaunch } from '@public/appInit/initLaunch'
import { splashManager } from './public/components/business/advertise-center'
import { reportHomePagePerfence } from './layout/report/home'
import { observeTaroToastForH5 } from '@public/utils/taroToastObserver'
import '@kye-netc/kye-miniui/style.css'
import '@/public/socket'
import './app.scss'
import { exposure } from './directive/exposure'
import { reportMsgReadMD, reportWechatMsgRead } from './public/report/message'
import { buglyLog } from './public/appPlugins/bugly'
import { isWxMiniApp, report_other_event } from './public/utils'
import { AppPlugin } from './public/appPlugins'

// 预加载设备 ID，后续调用直接走缓存
const preloadDeviceId = async () => {
  try {
    const deviceId = await AppPlugin.getDeviceId()
    console.log('[app] 设备ID预加载完成', deviceId ? '有值' : '空值')
  } catch (e) {
    console.warn('[app] 设备ID预加载失败', e)
  }
}

const appInit = async () => {
  try {
    // 切换手机号码，原token失效；用户手机切到后台之后，重新打开时会继续走下面逻辑，报token失效
    // 解决方案，切换手机号码原生化
    const currentPageRoute = Taro.getCurrentPages().slice?.(-1)?.[0]?.route
    if (currentPageRoute?.includes('modules/user/pages/changeLogin/index')) {
      return
    }
    setEnvConfig()
    getSystemInfo()
    initMaskPhone()
    // app bugly隐私协议检查
    buglyLog.checkPrivacyStatus()
    // 如果展示广告，则延迟开启全局信息调用
    await splashManager.onHide()
    await initUser()
    preloadDeviceId()
  } catch (error) {
    console.log(error)
  } finally {
    appGlobalInit()
  }
}

const App = createApp({
  async onShow() {
    console.log('[app] onShow')
  },
  async onLaunch(res) {
    appInit()
    // 冷启动时预加载设备 ID（不阻塞主
    reportHomePagePerfence.setIsOpenHomePage(res?.path)
    initGlobalLaunch()
    // 访问小程序的所有消息，已读状态上报
    reportMsgReadMD(res?.query)
    reportWechatMsgRead(res?.query)
    console.log('[app] onLaunch 冷启动')
    if (isWxMiniApp) {
      wx.onMemoryWarning((result) => {
        report_other_event('app-memory-warning', {
          level: result.level,
        })
      })
    }
  },
  mounted() {
    observeTaroToastForH5()
    H5RedirectToHome()
  },
})

App.directive('exposure', exposure)

// 本地开发警告处理隐藏
App.config.warnHandler = (msg, instance, trace) => {
  return null
}
// error错误抛出
App.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', err)
  throw err
}
// App.use(store, key)

App.use(pinia)

App.use(KyeMiniUi)

install(App)

checkVersion()

// 注册重定向
useRedirect()

getDefaultApplication()

export default App
